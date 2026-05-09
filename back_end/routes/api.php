<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\FactureController;
use App\Http\Controllers\ReparationController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// ============================================================
// AUTHENTICATION ROUTES (No Auth Required)
// ============================================================

Route::post('/login', [AuthController::class, 'login']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');

// ============================================================
// PROTECTED ROUTES (Auth Required)
// ============================================================

Route::middleware('auth:sanctum')->group(function () {

    // User Routes
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // ============================================================
    // CLIENTS CRUD ROUTES
    // ============================================================
    Route::prefix('clients')->group(function () {
        Route::get('/', [ClientController::class, 'index']);           // Get all clients
        Route::post('/', [ClientController::class, 'store']);          // Create client
        Route::get('/{id}', [ClientController::class, 'show']);        // Get single client
        Route::put('/{id}', [ClientController::class, 'update']);      // Update client
        Route::delete('/{id}', [ClientController::class, 'destroy']);  // Delete client
    });

    // ============================================================
    // FACTURES (INVOICES) CRUD ROUTES
    // ============================================================
    Route::prefix('factures')->group(function () {
        Route::get('/', [FactureController::class, 'index']);           // Get all invoices
        Route::post('/', [FactureController::class, 'store']);          // Create invoice
        Route::get('/{id}', [FactureController::class, 'show']);        // Get single invoice
        Route::put('/{id}', [FactureController::class, 'update']);      // Update invoice
        Route::delete('/{id}', [FactureController::class, 'destroy']);  // Delete invoice
    });

    // ============================================================
    // REPARATIONS CRUD ROUTES
    // ============================================================
    Route::prefix('reparations')->group(function () {
        Route::get('/', [ReparationController::class, 'index']);           // Get all repairs
        Route::post('/', [ReparationController::class, 'store']);          // Create repair
        Route::get('/{id}', [ReparationController::class, 'show']);        // Get single repair
        Route::put('/{id}', [ReparationController::class, 'update']);      // Update repair
        Route::delete('/{id}', [ReparationController::class, 'destroy']);  // Delete repair
    });

    // ============================================================
    // DASHBOARD STATISTICS ROUTES
    // ============================================================
    Route::get('/dashboard/stats', [FactureController::class, 'getDashboardStats']);

});
