<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * ============================================================
     * LOGIN ENDPOINT
     * ============================================================
     *
     * Purpose: Authenticate user with email and password
     *
     * Expected Input:
     * {
     *   "email": "comptable@gmail.com",
     *   "password": "12345"
     * }
     *
     * Returns: User object + API token for subsequent requests
     *
     * Error Cases:
     * - 401: Invalid credentials
     * - 422: Validation error (missing fields)
     */
    public function login(Request $request)
    {
        // Validate incoming request data
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Find user by email
        $user = User::where('email', $request->email)->first();

        // Check if user exists and password matches
        if (!$user || !Hash::check($request->password, $user->mdp)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Create API token for session management
        $token = $user->createToken('auth_token')->plainTextToken;

        // Return user data and token
        return response()->json([
            'user' => $user,
            'token' => $token,
            'message' => 'Login successful'
        ], 200);
    }

    /**
     * ============================================================
     * LOGOUT ENDPOINT
     * ============================================================
     *
     * Purpose: Revoke API token and end user session
     *
     * Returns: Success message
     *
     * Note: Requires authentication (token in header)
     */
    public function logout(Request $request)
    {
        // Revoke all tokens for the authenticated user
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Logout successful'
        ], 200);
    }
}
