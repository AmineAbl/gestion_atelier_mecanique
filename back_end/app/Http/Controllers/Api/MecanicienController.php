<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class MecanicienController extends Controller
{
    public function index()
    {
        return User::query()
            ->where('role', 'mecanicien')
            ->orderBy('nom')
            ->orderBy('prenom')
            ->get(['id', 'nom', 'prenom', 'email', 'role', 'created_at', 'updated_at']);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom' => ['required', 'string', 'max:255'],
            'prenom' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
            'password' => ['required', 'string', 'min:6'],
        ]);

        $user = User::query()->create([
            'nom' => $data['nom'],
            'prenom' => $data['prenom'],
            'email' => $data['email'],
            'mdp' => Hash::make($data['password']),
            'role' => 'mecanicien',
        ]);

        return response()->json(
            $user->only(['id', 'nom', 'prenom', 'email', 'role', 'created_at', 'updated_at']),
            201
        );
    }

    public function show(User $mecanicien)
    {
        if ($mecanicien->role !== 'mecanicien') {
            abort(404);
        }

        return $mecanicien->only(['id', 'nom', 'prenom', 'email', 'role', 'created_at', 'updated_at']);
    }

    public function update(Request $request, User $mecanicien)
    {
        if ($mecanicien->role !== 'mecanicien') {
            abort(404);
        }

        $data = $request->validate([
            'nom' => ['sometimes', 'string', 'max:255'],
            'prenom' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($mecanicien->id)],
            'password' => ['sometimes', 'string', 'min:6'],
        ]);

        if (! empty($data['password'] ?? null)) {
            $data['mdp'] = Hash::make($data['password']);
        }
        unset($data['password']);

        $mecanicien->update($data);

        return $mecanicien->fresh()->only(['id', 'nom', 'prenom', 'email', 'role', 'created_at', 'updated_at']);
    }

    public function destroy(User $mecanicien)
    {
        if ($mecanicien->role !== 'mecanicien') {
            abort(404);
        }

        $mecanicien->delete();

        return response()->json(null, 204);
    }
}
