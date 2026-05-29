<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Piece;
use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Http\Request;

class PieceController extends Controller
{
    public function index()
    {
        return Piece::query()->orderBy('nom')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nom' => ['required', 'string', 'max:255'],
            'prix' => ['required', 'numeric', 'min:0'],
            'quantite' => ['required', 'integer', 'min:0'],
        ]);

        $piece = Piece::query()->create($data);

        if ($loggedUser = $this->loggedUser($request)) {
            ActivityLogService::log(
                $loggedUser, 'create', 'piece', $piece->id,
                "Ajout de la pièce {$piece->nom}",
            );
        }

        return response()->json($piece, 201);
    }

    public function show(Piece $piece)
    {
        return $piece;
    }

    public function update(Request $request, Piece $piece)
    {
        $data = $request->validate([
            'nom' => ['sometimes', 'string', 'max:255'],
            'prix' => ['sometimes', 'numeric', 'min:0'],
            'quantite' => ['sometimes', 'integer', 'min:0'],
        ]);

        $old = $piece->toArray();
        $piece->update($data);

        if ($loggedUser = $this->loggedUser($request)) {
            ActivityLogService::log(
                $loggedUser, 'update', 'piece', $piece->id,
                "Modification de la pièce {$piece->nom}",
                $old, $piece->fresh()->toArray(),
            );
        }

        return $piece->fresh();
    }

    public function destroy(Piece $piece)
    {
        $label = $piece->nom;
        $old = $piece->toArray();
        $piece->delete();

        if ($loggedUser = $this->loggedUser(request())) {
            ActivityLogService::log(
                $loggedUser, 'delete', 'piece', $piece->id,
                "Suppression de la pièce {$label}",
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
