<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    public function index(Request $request)
    {
        $query = ActivityLog::with('user');

        // Filter by action
        if ($request->has('action')) {
            $query->where('action', $request->query('action'));
        }

        // Filter by entity type
        if ($request->has('entity_type')) {
            $query->where('entity_type', $request->query('entity_type'));
        }

        // Filter by user
        if ($request->has('user_id')) {
            $query->where('user_id', $request->query('user_id'));
        }

        // Filter by date range
        if ($request->has('date_from')) {
            $query->whereDate('created_at', '>=', $request->query('date_from'));
        }

        if ($request->has('date_to')) {
            $query->whereDate('created_at', '<=', $request->query('date_to'));
        }

        $limit = (int) ($request->query('limit') ?? 50);
        $offset = (int) ($request->query('offset') ?? 0);

        $total = $query->count();
        $logs = $query->orderBy('created_at', 'desc')
            ->limit($limit)
            ->offset($offset)
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'user_id' => $log->user_id,
                    'user_name' => $log->user ? $log->user->prenom . ' ' . $log->user->nom : 'Unknown',
                    'action' => $log->action,
                    'entity_type' => $log->entity_type,
                    'entity_id' => $log->entity_id,
                    'description' => $log->description,
                    'old_values' => $log->old_values,
                    'new_values' => $log->new_values,
                    'ip_address' => $log->ip_address,
                    'created_at' => $log->created_at->toIso8601String(),
                ];
            });

        return response()->json([
            'data' => $logs,
            'total' => $total,
            'limit' => $limit,
            'offset' => $offset,
        ]);
    }
}
