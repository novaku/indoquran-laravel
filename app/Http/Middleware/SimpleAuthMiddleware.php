<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class SimpleAuthMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Log the request for debugging
        Log::debug('SimpleAuthMiddleware processing request', [
            'path' => $request->path(),
            'method' => $request->method(),
            'has_bearer_token' => $request->bearerToken() ? true : false,
            'session_exists' => $request->hasSession() && $request->session()->isStarted(),
            'auth_check' => Auth::check(),
        ]);
        
        // First check if authenticated via session
        if (Auth::check()) {
            Log::debug('SimpleAuthMiddleware: User authenticated via session', [
                'user_id' => Auth::id()
            ]);
            return $next($request);
        }
        
        // Then check if authenticated via token
        if ($request->bearerToken()) {
            $token = $request->bearerToken();
            Log::debug('SimpleAuthMiddleware: Attempting token authentication', [
                'token_preview' => substr($token, 0, 10) . '...'
            ]);
            
            $tokenModel = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
            
            if ($tokenModel) {
                // Set the authenticated user for this request
                Auth::login($tokenModel->tokenable);
                Log::debug('SimpleAuthMiddleware: User authenticated via token', [
                    'user_id' => Auth::id(),
                    'token_id' => $tokenModel->id
                ]);
                return $next($request);
            } else {
                Log::warning('SimpleAuthMiddleware: Invalid token provided', [
                    'token_preview' => substr($token, 0, 10) . '...'
                ]);
            }
        }

        Log::warning('SimpleAuthMiddleware: Authentication failed');
        return response()->json(['message' => 'Unauthorized - Please login first'], 401);
    }
}
