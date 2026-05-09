<?php

namespace App\Http\Controllers;

use App\Models\Facture;
use App\Models\Reparation;
use App\Models\Client;
use Illuminate\Http\Request;

class FactureController extends Controller
{
    /**
     * ============================================================
     * GET ALL FACTURES (INVOICES)
     * ============================================================
     *
     * Purpose: Retrieve all invoices with details
     *
     * Returns: Array of factures with status and payment info
     *
     * Status Values: 'pending', 'completed', 'paid', 'unpaid'
     */
    public function index()
    {
        // Fetch all factures with relationships
        $factures = Facture::with(['users', 'reparations'])->get();

        return response()->json([
            'data' => $factures,
            'count' => $factures->count()
        ], 200);
    }

    /**
     * ============================================================
     * CREATE NEW FACTURE (INVOICE)
     * ============================================================
     *
     * Purpose: Generate new invoice for repair work
     *
     * Expected Input:
     * {
     *   "total_piece": 5,
     *   "cout": 150.00,
     *   "prix_total": 750.00,
     *   "date_validation": "2026-05-09",
     *   "statut": "pending"
     * }
     *
     * Returns: Created facture object with ID
     */
    public function store(Request $request)
    {
        // Validate incoming data
        $validated = $request->validate([
            'total_piece' => 'required|integer|min:0',
            'cout' => 'required|numeric|min:0',
            'prix_total' => 'required|numeric|min:0',
            'date_validation' => 'required|date',
            'statut' => 'required|in:pending,completed,paid,unpaid',
            'reparationId' => 'required|integer',
        ]);

        // Add user_id from authenticated user
        $validated['user_id'] = auth()->id() ?? 1; // Fallback for testing if no user is authenticated
        $validated['reparation_id'] = $validated['reparationId'];
        unset($validated['reparationId']);

        // Create new facture
        $facture = Facture::create($validated);

        return response()->json([
            'data' => $facture,
            'message' => 'Facture created successfully'
        ], 201);
    }

    /**
     * ============================================================
     * GET SINGLE FACTURE
     * ============================================================
     *
     * Purpose: Retrieve detailed invoice information
     *
     * Route Parameter: id (facture ID)
     *
     * Returns: Single facture with related data
     */
    public function show($id)
    {
        // Find facture with relationships
        $facture = Facture::with(['users', 'reparations'])->find($id);

        if (!$facture) {
            return response()->json([
                'message' => 'Facture not found'
            ], 404);
        }

        return response()->json([
            'data' => $facture
        ], 200);
    }

    /**
     * ============================================================
     * UPDATE FACTURE
     * ============================================================
     *
     * Purpose: Modify invoice details
     *
     * Route Parameter: id (facture ID)
     *
     * Expected Input (partial update):
     * {
     *   "statut": "paid",
     *   "prix_total": 800.00
     * }
     *
     * Returns: Updated facture object
     */
    public function update(Request $request, $id)
    {
        // Find facture
        $facture = Facture::find($id);

        if (!$facture) {
            return response()->json([
                'message' => 'Facture not found'
            ], 404);
        }

        // Validate incoming data
        $validated = $request->validate([
            'total_piece' => 'sometimes|integer|min:0',
            'cout' => 'sometimes|numeric|min:0',
            'prix_total' => 'sometimes|numeric|min:0',
            'date_validation' => 'sometimes|date',
            'statut' => 'sometimes|in:pending,completed,paid,unpaid',
            'reparationId' => 'sometimes|integer',
        ]);

        if (isset($validated['reparationId'])) {
            $validated['reparation_id'] = $validated['reparationId'];
            unset($validated['reparationId']);
        }

        // Update facture
        $facture->update($validated);

        return response()->json([
            'data' => $facture,
            'message' => 'Facture updated successfully'
        ], 200);
    }

    /**
     * ============================================================
     * DELETE FACTURE
     * ============================================================
     *
     * Purpose: Remove invoice from database
     *
     * Route Parameter: id (facture ID)
     *
     * Returns: Success message
     */
    public function destroy($id)
    {
        // Find facture
        $facture = Facture::find($id);

        if (!$facture) {
            return response()->json([
                'message' => 'Facture not found'
            ], 404);
        }

        // Delete facture
        $facture->delete();

        return response()->json([
            'message' => 'Facture deleted successfully'
        ], 200);
    }

    /**
     * ============================================================
     * GET DASHBOARD STATISTICS
     * ============================================================
     *
     * Purpose: Calculate and return financial metrics for dashboard
     *
     * Returns:
     * {
     *   "total_revenue": 10500.00,
     *   "total_pending": 2100.00,
     *   "total_costs": 3500.00,
     *   "total_profit": 7000.00,
     *   "profit_margin": 66.67,
     *   "completed_repairs": 45,
     *   "active_clients": 28,
     *   "invoices_this_month": 12,
     *   "completion_rate": 85.5,
     *   "recovery_rate": 92.3
     * }
     *
     * Note: For demo purposes, all values are initially 0
     * Users can add data through CRUD operations
     */
    public function getDashboardStats()
    {
        // Calculate total revenue from all factures
        $totalRevenue = Facture::sum('prix_total') ?? 0;

        // Calculate total pending amount (unpaid invoices)
        $totalPending = Facture::where('statut', 'unpaid')
            ->sum('prix_total') ?? 0;

        // Calculate total costs (sum of labor costs)
        $totalCosts = Facture::sum('cout') ?? 0;

        // Calculate total profit (revenue - costs)
        $totalProfit = max(0, $totalRevenue - $totalCosts);

        // Calculate profit margin percentage
        $profitMargin = $totalRevenue > 0
            ? round(($totalProfit / $totalRevenue) * 100, 2)
            : 0;

        // Count completed repairs
        $completedRepairs = Reparation::where('statut', 'completed')
            ->count() ?? 0;

        // Count active clients
        $activeClients = Client::count() ?? 0;

        // Count invoices created this month
        $invoicesThisMonth = Facture::whereMonth('created_at', now()->month)
            ->count() ?? 0;

        // Calculate completion rate
        $totalRepairs = Reparation::count() ?? 1;
        $completionRate = $totalRepairs > 0
            ? round(($completedRepairs / $totalRepairs) * 100, 2)
            : 0;

        // Calculate recovery rate (paid invoices / total invoices)
        $paidInvoices = Facture::where('statut', 'paid')
            ->count() ?? 0;
        $totalInvoices = Facture::count() ?? 1;
        $recoveryRate = $totalInvoices > 0
            ? round(($paidInvoices / $totalInvoices) * 100, 2)
            : 0;

        return response()->json([
            'total_revenue' => $totalRevenue,
            'total_pending' => $totalPending,
            'total_costs' => $totalCosts,
            'total_profit' => $totalProfit,
            'profit_margin' => $profitMargin,
            'completed_repairs' => $completedRepairs,
            'active_clients' => $activeClients,
            'invoices_this_month' => $invoicesThisMonth,
            'completion_rate' => $completionRate,
            'recovery_rate' => $recoveryRate
        ], 200);
    }
}
