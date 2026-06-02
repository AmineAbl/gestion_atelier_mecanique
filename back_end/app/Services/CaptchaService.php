<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use InvalidArgumentException;
use RuntimeException;

class CaptchaService
{
    public function sceneExists(string $sceneId): bool
    {
        return array_key_exists($sceneId, config('captcha.scenes', []));
    }

    public function createChallenge(string $sceneId): array
    {
        $correctAnswers = config("captcha.scenes.{$sceneId}");
        if (! is_array($correctAnswers) || $correctAnswers === []) {
            throw new RuntimeException('Unknown sceneId');
        }

        $challengeId = (string) Str::uuid();
        $ttl = (int) config('captcha.challenge_ttl_seconds', 300);

        Cache::put("captcha:challenge:{$challengeId}", [
            'correct_answers' => $correctAnswers,
        ], $ttl);

        $token = encrypt(json_encode([
            'challenge_id' => $challengeId,
            'expires_at' => now()->addSeconds($ttl)->timestamp,
        ], JSON_THROW_ON_ERROR));

        return [
            'token' => $token,
            'challengeToken' => $token,
            'sceneId' => $sceneId,
            'expiresIn' => $ttl,
        ];
    }

    public function verify(string $challengeToken, array $answers): array
    {
        $payload = $this->decodeChallenge($challengeToken);
        $stored = Cache::pull('captcha:challenge:'.$payload['challenge_id']);

        if (! is_array($stored)) {
            throw new InvalidArgumentException('Challenge already used or expired');
        }

        foreach ($stored['correct_answers'] as $key => $expected) {
            if ((string) ($answers[$key] ?? '') !== (string) $expected) {
                return ['verified' => false];
            }
        }

        $resultId = (string) Str::uuid();
        $ttl = (int) config('captcha.result_ttl_seconds', 120);
        Cache::put("captcha:result:{$resultId}", ['ok' => true], $ttl);

        $resultToken = encrypt(json_encode([
            'result_id' => $resultId,
            'verified' => true,
            'expires_at' => now()->addSeconds($ttl)->timestamp,
        ], JSON_THROW_ON_ERROR));

        return [
            'verified' => true,
            'token' => $resultToken,
            'resultToken' => $resultToken,
        ];
    }

    public function consumeResultToken(string $resultToken): bool
    {
        try {
            $payload = json_decode(decrypt($resultToken), true, 512, JSON_THROW_ON_ERROR);
        } catch (\Throwable) {
            return false;
        }

        if (! ($payload['verified'] ?? false) || (int) ($payload['expires_at'] ?? 0) < now()->timestamp) {
            return false;
        }

        $resultId = $payload['result_id'] ?? '';
        if ($resultId === '') {
            return false;
        }

        return Cache::pull("captcha:result:{$resultId}") !== null;
    }

    private function decodeChallenge(string $token): array
    {
        if ($token === '') {
            throw new InvalidArgumentException('Missing challenge token');
        }

        try {
            $payload = json_decode(decrypt($token), true, 512, JSON_THROW_ON_ERROR);
        } catch (\Throwable) {
            throw new InvalidArgumentException('Invalid or expired challenge');
        }

        if ((int) ($payload['expires_at'] ?? 0) < now()->timestamp || empty($payload['challenge_id'])) {
            throw new InvalidArgumentException('Invalid or expired challenge');
        }

        return $payload;
    }
}
