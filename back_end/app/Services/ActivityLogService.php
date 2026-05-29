<?php

namespace App\Services;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;

class ActivityLogService
{
    public static function log(
        User $user,
        string $action,
        string $entityType,
        ?int $entityId = null,
        ?string $description = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?Request $request = null
    ): ActivityLog {
        $ipAddress = $request?->ip() ?? null;
        $userAgent = $request?->userAgent() ?? null;

        return ActivityLog::create([
            'user_id' => $user->id,
            'action' => $action,
            'entity_type' => $entityType,
            'entity_id' => $entityId,
            'description' => $description,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
        ]);
    }
}
