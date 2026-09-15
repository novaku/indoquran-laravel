<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class LoginController extends Controller
{
    /**
     * Show the login form.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function showLoginForm()
    {
        return response()->json([
            'message' => 'Login form ready'
        ]);
    }

    /**
     * Handle a login request to the application.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse|\Illuminate\Http\RedirectResponse
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $user = Auth::user();
            
            // Check if this is an API request (no session handling)
            $isApi = $request->expectsJson() || str_starts_with($request->path(), 'api/');
            
            if ($isApi) {
                // API login - use JWT token-based authentication
                Log::info('API User logged in successfully', [
                    'user_id' => $user->id,
                    'remember' => $request->boolean('remember'),
                ]);
                
                // Create a JWT token for the user
                $token = auth('api')->login($user);
                
                return response()->json([
                    'user' => $user,
                    'message' => 'Login successful',
                    'token' => $token,
                    'token_type' => 'bearer',
                    'expires_in' => auth('api')->factory()->getTTL() * 60
                ]);
            } else {
                // Web login - use session-based authentication
                Log::info('Web User logged in successfully', [
                    'user_id' => $user->id,
                    'session_id' => $request->session()->getId(),
                    'remember' => $request->boolean('remember'),
                ]);
                
                // Force session to persist
                $request->session()->regenerate();
                $request->session()->save();
            }
            
            // Return appropriate response based on request type
            if ($isApi) {
                // Already returned above
            } else {
                // Web response - redirect or return JSON for SPA
                if ($request->expectsJson()) {
                    return response()->json([
                        'user' => $user,
                        'message' => 'Login successful'
                    ]);
                } else {
                    return redirect()->intended('/');
                }
            }
        }

        return response()->json([
            'message' => 'Email atau password tidak sesuai.',
            'errors' => ['email' => ['Email atau password tidak sesuai.']]
        ], 422);
    }

    /**
     * Log the user out of the application.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout(Request $request)
    {
        // Log user before logout for debugging
        $user = Auth::user();
        Log::info('User logout attempt', [
            'user_id' => $user ? $user->id : null
        ]);
        
        $isApi = $request->expectsJson() || str_starts_with($request->path(), 'api/');

        if ($isApi) {
            try {
                auth('api')->logout();
            } catch (\Exception $e) {
                Log::warning('JWT logout failed: ' . $e->getMessage());
            }
        }

        if ($user && method_exists($user, 'tokens')) {
            $user->tokens()->delete();
        }

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        
        return response()->json(['message' => 'Logged out successfully']);
    }
}
