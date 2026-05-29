<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Vehicule;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;

class VehiculeController extends Controller
{
    public function index(Request $request)
    {
        $query = Vehicule::query()->with('client')->orderBy('marque')->orderBy('modele');

        if ($request->filled('client_id')) {
            $query->where('client_id', $request->integer('client_id'));
        }

        return $query->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'marque' => ['required', 'string', 'max:255'],
            'modele' => ['required', 'string', 'max:255'],
            'immat' => ['required', 'string', 'max:255'],
            'carb' => ['required', 'string', 'max:255'],
            'transmission' => ['required', 'string', 'max:255'],
            'annee' => ['required', 'date'],
            'client_id' => ['required', 'exists:clients,id'],
        ]);

        $vehicule = Vehicule::query()->create($data);

        if ($loggedUser = $this->loggedUser($request)) {
            ActivityLogService::log(
                $loggedUser, 'create', 'vehicule', $vehicule->id,
                "Ajout du véhicule {$vehicule->marque} {$vehicule->modele} ({$vehicule->immat})",
            );
        }

        return response()->json($vehicule->load('client'), 201);
    }

    public function show(Vehicule $vehicule)
    {
        return $vehicule->load(['client', 'reparations.mecanicien']);
    }

    public function update(Request $request, Vehicule $vehicule)
    {
        $data = $request->validate([
            'marque' => ['sometimes', 'string', 'max:255'],
            'modele' => ['sometimes', 'string', 'max:255'],
            'immat' => ['sometimes', 'string', 'max:255'],
            'carb' => ['sometimes', 'string', 'max:255'],
            'transmission' => ['sometimes', 'string', 'max:255'],
            'annee' => ['sometimes', 'date'],
            'client_id' => ['sometimes', 'exists:clients,id'],
        ]);

        $old = $vehicule->toArray();
        $vehicule->update($data);

        if ($loggedUser = $this->loggedUser($request)) {
            ActivityLogService::log(
                $loggedUser, 'update', 'vehicule', $vehicule->id,
                "Modification du véhicule {$vehicule->marque} {$vehicule->modele} ({$vehicule->immat})",
                $old, $vehicule->fresh()->toArray(),
            );
        }

        return $vehicule->fresh()->load('client');
    }

    public function destroy(Vehicule $vehicule)
    {
        $label = "{$vehicule->marque} {$vehicule->modele} ({$vehicule->immat})";
        $old = $vehicule->toArray();
        $vehicule->delete();

        if ($loggedUser = $this->loggedUser(request())) {
            ActivityLogService::log(
                $loggedUser, 'delete', 'vehicule', $vehicule->id,
                "Suppression du véhicule {$label}",
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
