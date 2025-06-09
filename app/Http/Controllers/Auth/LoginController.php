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
            // Simple authentication without session management
            $user = Auth::user();
            
            // Log login
            \Log::info('User logged in successfully', [
                'user_id' => $user->id,
                'session_id' => $request->session()->getId(),
                'remember' => $request->boolean('remember'),
                'auth_cookie' => $request->cookie('remember_web_' . sha1('web')),
                'cookies' => $request->cookies->all()
            ]);
            
            // Create a token for the user
            $token = $user->createToken('auth-token')->plainTextToken;
            
            // Force session to persist
            $request->session()->regenerate();
            $request->session()->save();
            
            // For React SPA, always return JSON response
            return response()->json([
                'user' => $user,
                'message' => 'Login successful',
                'token' => $token
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
        // Log user before logout for debugging
        $user = Auth::user();
        \Log::info('User logout attempt', [
            'user_id' => $user ? $user->id : null
        ]);
        
        // Simple logout without session handling
        Auth::guard('web')->logout();
        
        return response()->json(['message' => 'Logged out successfully']);
    }
}
