<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CaptchaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;

class CaptchaController extends Controller
{
    public function __construct(private readonly CaptchaService $captcha) {}

    public function challenge(Request $request): JsonResponse
    {
        $sceneId = (string) $request->query('sceneId', '');
        if ($sceneId === '' || ! $this->captcha->sceneExists($sceneId)) {
            return response()->json(['error' => 'Invalid sceneId'], 400);
        }

        try {
            return response()->json($this->captcha->createChallenge($sceneId));
        } catch (\Throwable) {
            return response()->json(['error' => 'Could not create challenge'], 500);
        }
    }

    public function verify(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'challengeToken' => ['required', 'string'],
            'answers' => ['required', 'array'],
            'behavior' => ['nullable', 'array'],
        ]);

        try {
            $result = $this->captcha->verify($validated['challengeToken'], $validated['answers']);
        } catch (InvalidArgumentException $e) {
            return response()->json(['verified' => false, 'error' => $e->getMessage()], 400);
        }

        return response()->json($result, $result['verified'] ? 200 : 403);
    }
}
