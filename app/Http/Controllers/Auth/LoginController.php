<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            // Only regenerate session if it exists
            if ($request->hasSession()) {
                $request->session()->regenerate();
            }
            
            // For React SPA, always return JSON response
            $user = Auth::user();
            return response()->json([
                'user' => $user,
                'message' => 'Login successful'
            ]);
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
        Auth::logout();

        // Only invalidate session if it exists
        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->json(['message' => 'Logged out successfully']);
    }
}
