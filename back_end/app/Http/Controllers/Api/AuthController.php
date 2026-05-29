<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::query()->where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->mdp)) {
            return response()->json(['message' => 'Email ou mot de passe incorrect'], 401);
        }

        ActivityLogService::log(
            $user,
            'login',
            'auth',
            $user->id,
            "Connexion de {$user->prenom} {$user->nom} ({$user->role})",
            null,
            null,
            $request,
        );

        return response()->json([
            'id' => $user->id,
            'nom' => $user->nom,
            'prenom' => $user->prenom,
            'cin' => $user->cin,
            'email' => $user->email,
            'role' => $user->role,
            'name' => $user->prenom.' '.$user->nom,
        ]);
    }

    public function logout(Request $request)
    {
        $userId = $request->header('X-User-Id');
        $user = $userId ? User::find($userId) : null;

        if ($user) {
            ActivityLogService::log(
                $user,
                'logout',
                'auth',
                $user->id,
                "Déconnexion de {$user->prenom} {$user->nom} ({$user->role})",
                null,
                null,
                $request,
            );
        }

        return response()->json(['message' => 'Déconnecté avec succès']);
    }
}
