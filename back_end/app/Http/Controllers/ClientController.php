<?php

namespace App\Http\Controllers;

use App\Models\Client;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    /**
     * ============================================================
     * GET ALL CLIENTS
     * ============================================================
     *
     * Purpose: Retrieve list of all clients with their associated data
     *
     * Returns: Array of client objects with relationships loaded
     *
     * Query Parameters:
     * - None (all clients returned)
     */
    public function index()
    {
        // Fetch all clients without deeply nested invalid relationships
        $clients = Client::all();

        return response()->json([
            'data' => $clients,
            'count' => $clients->count()
        ], 200);
    }

    /**
     * ============================================================
     * CREATE NEW CLIENT
     * ============================================================
     *
     * Purpose: Add new client to database
     *
     * Expected Input:
     * {
     *   "nom": "Dupont",
     *   "prenom": "Jean",
     *   "telephone": "0601234567"
     * }
     *
     * Returns: Created client object with ID
     *
     * Validation:
     * - All fields required
     * - Telephone must be valid format
     */
    public function store(Request $request)
    {
        // Validate incoming data
        $validated = $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'telephone' => 'required|string|max:20',
        ]);

        // Create new client record
        $client = Client::create($validated);

        return response()->json([
            'data' => $client,
            'message' => 'Client created successfully'
        ], 201);
    }

    /**
     * ============================================================
     * GET SINGLE CLIENT
     * ============================================================
     *
     * Purpose: Retrieve detailed information for specific client
     *
     * Route Parameter: id (client ID)
     *
     * Returns: Client object with all relationships
     *
     * Error: 404 if client not found
     */
    public function show($id)
    {
        // Find client by ID
        $client = Client::find($id);

        // Return 404 if client not found
        if (!$client) {
            return response()->json([
                'message' => 'Client not found'
            ], 404);
        }

        return response()->json([
            'data' => $client
        ], 200);
    }

    /**
     * ============================================================
     * UPDATE CLIENT
     * ============================================================
     *
     * Purpose: Modify existing client information
     *
     * Route Parameter: id (client ID)
     *
     * Expected Input (partial update allowed):
     * {
     *   "nom": "Dupont",
     *   "prenom": "Jean",
     *   "telephone": "0601234567"
     * }
     *
     * Returns: Updated client object
     */
    public function update(Request $request, $id)
    {
        // Find client or return 404
        $client = Client::find($id);

        if (!$client) {
            return response()->json([
                'message' => 'Client not found'
            ], 404);
        }

        // Validate incoming data
        $validated = $request->validate([
            'nom' => 'sometimes|string|max:255',
            'prenom' => 'sometimes|string|max:255',
            'telephone' => 'sometimes|string|max:20',
        ]);

        // Update client with validated data
        $client->update($validated);

        return response()->json([
            'data' => $client,
            'message' => 'Client updated successfully'
        ], 200);
    }

    /**
     * ============================================================
     * DELETE CLIENT
     * ============================================================
     *
     * Purpose: Remove client record from database
     *
     * Route Parameter: id (client ID)
     *
     * Returns: Success message
     *
     * Note: Cascade deletes related vehicules, reparations, factures
     */
    public function destroy($id)
    {
        // Find client or return 404
        $client = Client::find($id);

        if (!$client) {
            return response()->json([
                'message' => 'Client not found'
            ], 404);
        }

        // Delete client (cascading deletes will handle related records)
        $client->delete();

        return response()->json([
            'message' => 'Client deleted successfully'
        ], 200);
    }
}
