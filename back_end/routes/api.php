<?php

use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\CaptchaController;
use App\Http\Controllers\Api\DemoRequestController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ClientController;
use App\Http\Controllers\Api\ComptableController;
use App\Http\Controllers\Api\FactureController;
use App\Http\Controllers\Api\MecanicienController;
use App\Http\Controllers\Api\PieceController;
use App\Http\Controllers\Api\ReparationController;
use App\Http\Controllers\Api\VehiculeController;
use App\Models\User;
use Illuminate\Support\Facades\Route;

Route::bind('mecanicien', function (string $value) {
    return User::query()->where('role', 'mecanicien')->whereKey($value)->firstOrFail();
});

Route::bind('comptable', function (string $value) {
    return User::query()->where('role', 'comptable')->whereKey($value)->firstOrFail();
});

Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/logout', [AuthController::class, 'logout']);

Route::get('/challenge', [CaptchaController::class, 'challenge']);
Route::post('/verify', [CaptchaController::class, 'verify']);
Route::post('/demo-requests', [DemoRequestController::class, 'store']);

Route::apiResource('clients', ClientController::class);
Route::apiResource('factures', FactureController::class);
Route::post('factures/{facture}/pdf', [FactureController::class, 'uploadPdf']);
Route::apiResource('vehicules', VehiculeController::class);
Route::apiResource('reparations', ReparationController::class);
Route::apiResource('pieces', PieceController::class);
Route::apiResource('mecaniciens', MecanicienController::class);
Route::apiResource('comptables', ComptableController::class);

Route::get('/activity-logs', [ActivityLogController::class, 'index']);
