<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class ComptableController extends Controller
{
    public function index()
    {
        return User::query()
            ->where('role', 'comptable')
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
            'role' => 'comptable',
        ]);

        return response()->json(
            $user->only(['id', 'nom', 'prenom', 'email', 'role', 'created_at', 'updated_at']),
            201
        );
    }

    public function show(User $comptable)
    {
        if ($comptable->role !== 'comptable') {
            abort(404);
        }

        return $comptable->only(['id', 'nom', 'prenom', 'email', 'role', 'created_at', 'updated_at']);
    }

    public function update(Request $request, User $comptable)
    {
        if ($comptable->role !== 'comptable') {
            abort(404);
        }

        $data = $request->validate([
            'nom' => ['sometimes', 'string', 'max:255'],
            'prenom' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($comptable->id)],
            'password' => ['sometimes', 'string', 'min:6'],
        ]);

        if (! empty($data['password'] ?? null)) {
            $data['mdp'] = Hash::make($data['password']);
        }
        unset($data['password']);

        $comptable->update($data);

        return $comptable->fresh()->only(['id', 'nom', 'prenom', 'email', 'role', 'created_at', 'updated_at']);
    }

    public function destroy(User $comptable)
    {
        if ($comptable->role !== 'comptable') {
            abort(404);
        }

        $comptable->delete();

        return response()->json(null, 204);
    }
}
