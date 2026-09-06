<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class StaticApiKeyMiddleware
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
        $validKey = config('services.article_api.key') ?: env('ARTICLE_API_KEY', '1bb6ff1cc82c503c249ff7a4e91cd7b7b77df4a67cb7b4ac54d5efd117802f2b');

        // Check key from various standard headers and request parameters
        $providedKey = $request->header('X-API-Key')
            ?? $request->header('X-Api-Key')
            ?? $request->bearerToken()
            ?? $request->header('api-key')
            ?? $request->input('api_key')
            ?? $request->input('key');

        if (!$providedKey || !hash_equals((string) $validKey, (string) $providedKey)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized: Invalid or missing API key',
            ], Response::HTTP_UNAUTHORIZED);
        }

        return $next($request);
    }
}
