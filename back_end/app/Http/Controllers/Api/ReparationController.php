<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reparation;
use Illuminate\Http\Request;

class ReparationController extends Controller
{
    public function index(Request $request)
    {
        $query = Reparation::query()
            ->with(['vehicule.client', 'mecanicien', 'pieces'])
            ->orderByDesc('created_at');

        if ($request->filled('statut')) {
            $query->where('statut', $request->string('statut'));
        }

        if ($request->filled('vehicule_id')) {
            $query->where('vehicule_id', $request->integer('vehicule_id'));
        }

if ($request->filled('user_id')) {
    $query->where('user_id', $request->integer('user_id'));
}

return $query->get()
    ->map(fn (Reparation $r) => $this->serializeReparation($r));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'description' => ['required', 'string', 'max:2000'],
            'statut' => ['required', 'string', 'max:255'],
            'date_debut' => ['nullable', 'date'],
            'date_fin' => ['nullable', 'date'],
            'date_prevue_fin' => ['nullable', 'date'],
            'cout' => ['required', 'numeric', 'min:0'],
            'vehicule_id' => ['required', 'exists:vehicules,id'],
            'user_id' => ['required', 'exists:users,id'],
            'pieces' => ['nullable', 'array'],
            'pieces.*.piece_id' => ['required_with:pieces', 'exists:pieces,id'],
            'pieces.*.quantite' => ['required_with:pieces', 'integer', 'min:1'],
            'pieces.*.prix_utilise' => ['required_with:pieces', 'numeric', 'min:0'],
        ]);

        $pieces = $data['pieces'] ?? [];
        unset($data['pieces']);

        $user = \App\Models\User::query()->findOrFail($data['user_id']);
        if ($user->role !== 'mecanicien') {
            return response()->json(['message' => 'L’utilisateur assigné doit être un mécanicien'], 422);
        }

        $reparation = Reparation::query()->create($data);

        foreach ($pieces as $row) {
            $reparation->pieces()->attach($row['piece_id'], [
                'quantite' => $row['quantite'],
                'prix_utilise' => $row['prix_utilise'],
            ]);
        }

        return response()->json($reparation->load(['vehicule.client', 'mecanicien', 'pieces']), 201);
    }

    public function show(Reparation $reparation)
    {
        return $reparation->load(['vehicule.client', 'mecanicien', 'pieces']);
    }

    public function update(Request $request, Reparation $reparation)
    {
        $data = $request->validate([
            'description' => ['sometimes', 'string', 'max:2000'],
            'statut' => ['sometimes', 'string', 'max:255'],
            'date_debut' => ['sometimes', 'nullable', 'date'],
            'date_fin' => ['sometimes', 'nullable', 'date'],
            'date_prevue_fin' => ['sometimes', 'nullable', 'date'],
            'cout' => ['sometimes', 'numeric', 'min:0'],
            'vehicule_id' => ['sometimes', 'exists:vehicules,id'],
            'user_id' => ['sometimes', 'exists:users,id'],
            'pieces' => ['sometimes', 'nullable', 'array'],
            'pieces.*.piece_id' => ['required_with:pieces', 'exists:pieces,id'],
            'pieces.*.quantite' => ['required_with:pieces', 'integer', 'min:1'],
            'pieces.*.prix_utilise' => ['required_with:pieces', 'numeric', 'min:0'],
        ]);

        if (isset($data['user_id'])) {
            $user = \App\Models\User::query()->findOrFail($data['user_id']);
            if ($user->role !== 'mecanicien') {
                return response()->json(['message' => 'L’utilisateur assigné doit être un mécanicien'], 422);
            }
        }

        $pieces = null;
        if (array_key_exists('pieces', $data)) {
            $pieces = $data['pieces'];
            unset($data['pieces']);
        }

        $reparation->update($data);

        if (is_array($pieces)) {
            $sync = [];
            foreach ($pieces as $row) {
                $sync[$row['piece_id']] = [
                    'quantite' => $row['quantite'],
                    'prix_utilise' => $row['prix_utilise'],
                ];
            }
            $reparation->pieces()->sync($sync);
        }

        return $reparation->fresh()->load(['vehicule.client', 'mecanicien', 'pieces']);
    }

    public function destroy(Reparation $reparation)
    {
        $reparation->delete();

        return response()->json(null, 204);
    }

    private function serializeReparation(Reparation $r): array
    {
        return [
            'id' => $r->id,
            'description' => $r->description,
            'statut' => $r->statut,
            'date_debut' => $r->date_debut?->format('Y-m-d'),
            'date_fin' => $r->date_fin?->format('Y-m-d'),
            'date_prevue_fin' => $r->date_prevue_fin?->format('Y-m-d'),
            'cout' => (float) $r->cout,
            'vehicule_id' => $r->vehicule_id,
            'vehiculeId' => $r->vehicule_id,
            'user_id' => $r->user_id,
            'userId' => $r->user_id,
            'vehicule' => $r->vehicule ? [
                'id' => $r->vehicule->id,
                'client_id' => $r->vehicule->client_id,
                'client' => $r->vehicule->client ? [
                    'id' => $r->vehicule->client->id,
                    'nom' => $r->vehicule->client->nom,
                    'prenom' => $r->vehicule->client->prenom,
                ] : null,
            ] : null,
        ];
    }
}
