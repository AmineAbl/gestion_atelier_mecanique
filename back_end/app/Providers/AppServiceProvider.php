<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\ValidationException;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        User::saving(function (User $user): void {
            if ($user->role !== 'responsable') {
                return;
            }

            $query = User::query()->where('role', 'responsable');

            if ($user->exists) {
                $query->where('id', '!=', $user->id);
            }

            if ($query->exists()) {
                throw ValidationException::withMessages([
                    'role' => ['Un seul compte « responsable » est autorisé dans l’application.'],
                ]);
            }
        });
    }
}
