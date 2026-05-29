<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ActivityLogService;
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
            ->get(['id', 'nom', 'prenom', 'cin', 'email', 'role', 'created_at', 'updated_at']);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom' => ['required', 'string', 'max:255'],
            'prenom' => ['required', 'string', 'max:255'],
            'cin' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
            'password' => ['required', 'string', 'min:6'],
        ]);

        $user = User::query()->create([
            'nom' => $data['nom'],
            'prenom' => $data['prenom'],
            'cin' => $data['cin'],
            'email' => $data['email'],
            'mdp' => Hash::make($data['password']),
            'role' => 'comptable',
        ]);

        if ($loggedUser = $this->loggedUser($request)) {
            ActivityLogService::log(
                $loggedUser, 'create', 'comptable', $user->id,
                "Création du comptable {$user->prenom} {$user->nom}",
            );
        }

        return response()->json(
            $user->only(['id', 'nom', 'prenom', 'cin', 'email', 'role', 'created_at', 'updated_at']),
            201
        );
    }

    public function show(User $comptable)
    {
        if ($comptable->role !== 'comptable') {
            abort(404);
        }

        return $comptable->only(['id', 'nom', 'prenom', 'cin', 'email', 'role', 'created_at', 'updated_at']);
    }

    public function update(Request $request, User $comptable)
    {
        if ($comptable->role !== 'comptable') {
            abort(404);
        }

        $data = $request->validate([
            'nom' => ['sometimes', 'string', 'max:255'],
            'prenom' => ['sometimes', 'string', 'max:255'],
            'cin' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($comptable->id)],
            'password' => ['sometimes', 'string', 'min:6'],
        ]);

        if (! empty($data['password'] ?? null)) {
            $data['mdp'] = Hash::make($data['password']);
        }
        unset($data['password']);

        $old = $comptable->toArray();
        $comptable->update($data);

        if ($loggedUser = $this->loggedUser($request)) {
            ActivityLogService::log(
                $loggedUser, 'update', 'comptable', $comptable->id,
                "Modification du comptable {$comptable->prenom} {$comptable->nom}",
                $old, $comptable->fresh()->toArray(),
            );
        }

        return $comptable->fresh()->only(['id', 'nom', 'prenom', 'cin', 'email', 'role', 'created_at', 'updated_at']);
    }

    public function destroy(User $comptable)
    {
        if ($comptable->role !== 'comptable') {
            abort(404);
        }

        $label = "{$comptable->prenom} {$comptable->nom}";
        $old = $comptable->toArray();
        $comptable->delete();

        if ($loggedUser = $this->loggedUser(request())) {
            ActivityLogService::log(
                $loggedUser, 'delete', 'comptable', $comptable->id,
                "Suppression du comptable {$label}",
                $old, null,
            );
        }

        return response()->json(null, 204);
    }

    private function loggedUser(Request $request): ?User
    {
        $id = $request->header('X-User-Id') ?? $request->input('logged_user_id');
        return $id ? User::find($id) : null;
    }
}
