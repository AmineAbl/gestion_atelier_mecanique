<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Vehicule;
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

        $vehicule->update($data);

        return $vehicule->fresh()->load('client');
    }

    public function destroy(Vehicule $vehicule)
    {
        $vehicule->delete();

        return response()->json(null, 204);
    }
}
