<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DemoRequest;
use App\Services\CaptchaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DemoRequestController extends Controller
{
    public function __construct(private readonly CaptchaService $captcha) {}

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'workshop' => ['required', 'string', 'max:255'],
            'plan' => ['required', 'string', 'in:Standard,Pro'],
            'team_size' => ['required', 'string', 'max:50'],
            'message' => ['nullable', 'string', 'max:5000'],
            'captcha_token' => ['required', 'string'],
            'website' => ['nullable', 'string', 'max:255'],
        ]);

        if (filled($validated['website'] ?? null)) {
            return response()->json(['message' => 'Requete bloquee.'], 422);
        }

        if (! $this->captcha->consumeResultToken($validated['captcha_token'])) {
            return response()->json(['message' => 'Verification CAPTCHA invalide ou expiree.'], 422);
        }

        $demo = DemoRequest::query()->create([
            'full_name' => $validated['full_name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'workshop' => $validated['workshop'],
            'plan' => $validated['plan'],
            'team_size' => $validated['team_size'],
            'message' => $validated['message'] ?? null,
        ]);

        return response()->json([
            'message' => 'Demande enregistree. Nous vous contacterons tres vite.',
            'id' => $demo->id,
        ], 201);
    }
}
