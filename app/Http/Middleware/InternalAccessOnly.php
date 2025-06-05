<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class InternalAccessOnly
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next): mixed
    {
        // Check if the request is coming from an internal source
        // We'll check both the referer (for browser requests) and the origin/user-agent (for API requests)
        $referer = $request->header('referer');
        $origin = $request->header('origin');
        $userAgent = $request->header('user-agent');
        
        // Allow requests from the same application (internal)
        if ($referer && (
            str_contains($referer, $request->getHost()) || 
            str_contains($referer, 'localhost') ||
            str_contains($referer, '127.0.0.1')
        )) {
            return $next($request);
        }
        
        // Allow requests from the frontend application
        if ($origin && (
            str_contains($origin, $request->getHost()) || 
            str_contains($origin, 'localhost') ||
            str_contains($origin, '127.0.0.1')
        )) {
            return $next($request);
        }
        
        // If it's a XMLHttpRequest (AJAX request)
        if ($request->ajax() || $request->header('X-Requested-With') === 'XMLHttpRequest') {
            return $next($request);
        }
        
        // Check for specific tokens or headers your application might use
        if ($request->header('X-Internal-Request') === config('app.internal_api_key')) {
            return $next($request);
        }
        
        // Block requests that don't match any of the above criteria
        return response()->json([
            'message' => 'Access denied. This API can only be accessed from the application.'
        ], Response::HTTP_FORBIDDEN);
    }
}
