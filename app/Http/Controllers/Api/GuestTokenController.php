<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class GuestTokenController extends Controller
{
    /**
     * Issue a JWT token for a guest user.
     * If the guest user doesn't exist, create it.
     */
    public function getToken(Request $request)
    {
        try {
            // Find or create the guest user
            $guestUser = User::firstOrCreate(
                ['email' => 'guest@indoquran.web.id'],
                [
                    'name' => 'Guest User',
                    'password' => Hash::make(\Illuminate\Support\Str::random(32)),
                    'is_admin' => false,
                ]
            );

            // Generate JWT token for the guest user
            $token = auth('api')->login($guestUser);

            return response()->json([
                'success' => true,
                'token' => $token,
                'token_type' => 'bearer',
                'expires_in' => auth('api')->factory()->getTTL() * 60,
                'user_type' => 'guest'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to generate guest token: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate token'
            ], 500);
        }
    }
}
