<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function index()
    {
        return Client::query()->orderBy('nom')->orderBy('prenom')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom' => ['required', 'string', 'max:255'],
            'prenom' => ['required', 'string', 'max:255'],
            'telephone' => ['required', 'string', 'max:255'],
            'cin' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
        ]);

        $client = Client::query()->create($data);

        if ($loggedUser = $this->loggedUser($request)) {
            ActivityLogService::log(
                $loggedUser, 'create', 'client', $client->id,
                "Création du client {$client->prenom} {$client->nom}",
            );
        }

        return response()->json($client, 201);
    }

    public function show(Client $client)
    {
        return $client->load('vehicules');
    }

    public function update(Request $request, Client $client)
    {
        $data = $request->validate([
            'nom' => ['sometimes', 'string', 'max:255'],
            'prenom' => ['sometimes', 'string', 'max:255'],
            'telephone' => ['sometimes', 'string', 'max:255'],
            'cin' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'nullable', 'email', 'max:255'],
        ]);

        $old = $client->toArray();
        $client->update($data);

        if ($loggedUser = $this->loggedUser($request)) {
            ActivityLogService::log(
                $loggedUser, 'update', 'client', $client->id,
                "Modification du client {$client->prenom} {$client->nom}",
                $old, $client->fresh()->toArray(),
            );
        }

        return $client->fresh();
    }

    public function destroy(Client $client)
    {
        $label = "{$client->prenom} {$client->nom}";
        $old = $client->toArray();
        $client->delete();

        if ($loggedUser = $this->loggedUser(request())) {
            ActivityLogService::log(
                $loggedUser, 'delete', 'client', $client->id,
                "Suppression du client {$label}",
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
