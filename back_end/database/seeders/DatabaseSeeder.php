<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Un seul utilisateur avec le rôle responsable (voir AppServiceProvider).
        User::query()->updateOrCreate(
            ['email' => 'responsable@atelier.com'],
            [
                'nom' => 'Admin',
                'prenom' => 'Responsable',
                'mdp' => Hash::make('password123'),
                'role' => 'responsable',
            ]
        );

        User::query()->updateOrCreate(
            ['email' => 'comptable@atelier.com'],
            [
                'nom' => 'Compta',
                'prenom' => 'Jean',
                'mdp' => Hash::make('password123'),
                'role' => 'comptable',
            ]
        );

        User::query()->updateOrCreate(
            ['email' => 'mecanicien@atelier.com'],
            [
                'nom' => 'Garage',
                'prenom' => 'Paul',
                'mdp' => Hash::make('password123'),
                'role' => 'mecanicien',
            ]
        );

        User::query()->updateOrCreate(
            ['email' => 'mecanicien2@atelier.com'],
            [
                'nom' => 'Dupont',
                'prenom' => 'Marc',
                'mdp' => Hash::make('password123'),
                'role' => 'mecanicien',
            ]
        );
    }
}
