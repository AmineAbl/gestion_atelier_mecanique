<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Piece;
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

        return response()->json(Piece::query()->create($data), 201);
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

        $piece->update($data);

        return $piece->fresh();
    }

    public function destroy(Piece $piece)
    {
        $piece->delete();

        return response()->json(null, 204);
    }
}
