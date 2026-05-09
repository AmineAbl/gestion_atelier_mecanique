<?php

namespace App\Http\Controllers;

use App\Models\Reparation;
use Illuminate\Http\Request;

class ReparationController extends Controller
{
    /**
     * ============================================================
     * GET ALL REPARATIONS
     * ============================================================
     *
     * Purpose: Retrieve list of all vehicle repairs
     *
     * Returns: Array of repairs with client and vehicle info
     *
     * Status Types: 'pending', 'in_progress', 'completed', 'on_hold'
     */
    public function index()
    {
        // Fetch all repairs with valid relationships
        $reparations = Reparation::with(['vehicules'])->get();

        return response()->json([
            'data' => $reparations,
            'count' => $reparations->count()
        ], 200);
    }

    /**
     * ============================================================
     * CREATE NEW REPAIR
     * ============================================================
     *
     * Purpose: Register new vehicle repair job
     *
     * Expected Input:
     * {
     *   "client_id": 5,
     *   "vehicule_id": 8,
     *   "description": "Engine overheating issue",
     *   "date_entree": "2026-05-09",
     *   "date_sortie_prevue": "2026-05-11",
     *   "statut": "in_progress"
     * }
     *
     * Returns: Created repair record with ID
     */
    public function store(Request $request)
    {
        // Validate incoming data
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'vehicule_id' => 'required|exists:vehicules,id',
            'description' => 'required|string|max:1000',
            'date_entree' => 'required|date',
            'date_sortie_prevue' => 'required|date|after:date_entree',
            'statut' => 'required|in:pending,in_progress,completed,on_hold',
        ]);

        // Create new repair record
        $reparation = Reparation::create($validated);

        return response()->json([
            'data' => $reparation,
            'message' => 'Reparation created successfully'
        ], 201);
    }

    /**
     * ============================================================
     * GET SINGLE REPAIR
     * ============================================================
     *
     * Purpose: Retrieve detailed repair information
     *
     * Route Parameter: id (repair ID)
     *
     * Returns: Single repair with all relationships
     */
    public function show($id)
    {
        // Find repair with valid relationships
        $reparation = Reparation::with(['vehicules'])->find($id);

        if (!$reparation) {
            return response()->json([
                'message' => 'Reparation not found'
            ], 404);
        }

        return response()->json([
            'data' => $reparation
        ], 200);
    }

    /**
     * ============================================================
     * UPDATE REPAIR
     * ============================================================
     *
     * Purpose: Modify repair details or status
     *
     * Route Parameter: id (repair ID)
     *
     * Expected Input (partial update):
     * {
     *   "statut": "completed",
     *   "date_sortie_prevue": "2026-05-10"
     * }
     *
     * Returns: Updated repair record
     */
    public function update(Request $request, $id)
    {
        // Find repair
        $reparation = Reparation::find($id);

        if (!$reparation) {
            return response()->json([
                'message' => 'Reparation not found'
            ], 404);
        }

        // Validate incoming data
        $validated = $request->validate([
            'client_id' => 'sometimes|exists:clients,id',
            'vehicule_id' => 'sometimes|exists:vehicules,id',
            'description' => 'sometimes|string|max:1000',
            'date_entree' => 'sometimes|date',
            'date_sortie_prevue' => 'sometimes|date',
            'statut' => 'sometimes|in:pending,in_progress,completed,on_hold',
        ]);

        // Update repair
        $reparation->update($validated);

        return response()->json([
            'data' => $reparation,
            'message' => 'Reparation updated successfully'
        ], 200);
    }

    /**
     * ============================================================
     * DELETE REPAIR
     * ============================================================
     *
     * Purpose: Remove repair record from database
     *
     * Route Parameter: id (repair ID)
     *
     * Returns: Success message
     */
    public function destroy($id)
    {
        // Find repair
        $reparation = Reparation::find($id);

        if (!$reparation) {
            return response()->json([
                'message' => 'Reparation not found'
            ], 404);
        }

        // Delete repair
        $reparation->delete();

        return response()->json([
            'message' => 'Reparation deleted successfully'
        ], 200);
    }
}
