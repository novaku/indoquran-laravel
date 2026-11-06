<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class ApiCacheMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string $duration - Cache duration (e.g., '7d', '30d', '1h', '60m')
     */
    public function handle(Request $request, Closure $next, string $duration = '1h'): Response
    {
        // Only apply caching to GET requests
        if (!$request->isMethod('GET')) {
            return $next($request);
        }

        // Disable caching during unit testing
        if (app()->environment('testing')) {
            $response = $next($request);
            if ($response->getStatusCode() === 200) {
                $response->headers->set('Cache-Control', 'no-cache, private');
                $response->headers->set('Pragma', 'no-cache');
                $response->headers->set('Expires', '0');
            }
            return $response;
        }

        $cacheTime = $this->parseDuration($duration);
        $clientEtag = $request->header('If-None-Match');
        $segment = $request->segment(2) ?? 'general';
        $cacheKey = "api_http_resp:{$segment}:" . md5($request->fullUrl());
        $legacyKey = 'api_http_resp:' . md5($request->fullUrl());
        $cacheControl = $this->getCacheControlHeader($request, $cacheTime);

        // Check Redis server cache (skip only during testing)
        if (!app()->environment('testing')) {
            $cached = null;
            if (Cache::has($cacheKey)) {
                $cached = Cache::get($cacheKey);
            } elseif (Cache::has($legacyKey)) {
                $cached = Cache::get($legacyKey);
            }

            if (is_array($cached) && isset($cached['content'], $cached['etag'])) {
                // 304 Not Modified if client ETag matches
                if ($clientEtag && $clientEtag === $cached['etag']) {
                    return response('', 304)->withHeaders([
                        'Cache-Control' => $cacheControl,
                        'ETag' => $cached['etag'],
                        'Expires' => gmdate('D, d M Y H:i:s', time() + $cacheTime) . ' GMT',
                        'X-Cache' => 'HIT-304',
                    ]);
                }

                return response($cached['content'], 200, [
                    'Content-Type' => $cached['content_type'] ?? 'application/json',
                    'Cache-Control' => $cacheControl,
                    'ETag' => $cached['etag'],
                    'Expires' => gmdate('D, d M Y H:i:s', time() + $cacheTime) . ' GMT',
                    'X-Cache' => 'HIT',
                ]);
            }
        }

        $response = $next($request);
        
        // Cache successful 200 responses
        if ($response->getStatusCode() === 200) {
            $content = $response->getContent();
            $etag = '"' . md5($content) . '"';
            
            // Handle conditional requests for 304 Not Modified
            if ($clientEtag && $clientEtag === $etag) {
                return response('', 304)->withHeaders([
                    'Cache-Control' => $cacheControl,
                    'ETag' => $etag,
                    'Expires' => gmdate('D, d M Y H:i:s', time() + $cacheTime) . ' GMT',
                    'X-Cache' => 'HIT-304',
                ]);
            }
            
            // Set comprehensive cache headers
            $response->headers->set('Cache-Control', $cacheControl, true);
            $response->headers->set('Expires', gmdate('D, d M Y H:i:s', time() + $cacheTime) . ' GMT', true);
            $response->headers->set('Last-Modified', gmdate('D, d M Y H:i:s') . ' GMT', true);
            $response->headers->set('ETag', $etag, true);
            $response->headers->set('X-Cache', 'MISS', true);
            $response->headers->remove('pragma');

            // Store in Redis server-side cache
            if (!app()->environment('testing')) {
                try {
                    Cache::put($cacheKey, [
                        'content' => $content,
                        'content_type' => $response->headers->get('Content-Type', 'application/json'),
                        'etag' => $etag,
                    ], $cacheTime);
                } catch (\Throwable $e) {
                    // Silently continue if cache store fails
                }
            }
        }

        return $response;
    }

    /**
     * Determine optimal Cache-Control header based on endpoint characteristics.
     */
    protected function getCacheControlHeader(Request $request, int $cacheTime): string
    {
        // For article & tag listing endpoints, keep client browser cache short (10s)
        // with must-revalidate so new articles appear immediately on refresh,
        // while allowing intermediate caches to use s-maxage.
        if ($request->is('api/articles*') || $request->is('api/tags*')) {
            return "public, max-age=10, s-maxage={$cacheTime}, stale-while-revalidate=60, must-revalidate";
        }

        return "public, max-age={$cacheTime}, stale-while-revalidate=86400";
    }
    
    /**
     * Perform any final actions for the request lifecycle.
     */
    public function terminate(Request $request, Response $response): void
    {
        // This method is called after the response has been sent to the browser
        // We can use this to ensure our headers are the final ones set
    }

    /**
     * Parse duration string into seconds
     */
    private function parseDuration(string $duration): int
    {
        $value = (int) substr($duration, 0, -1);
        $unit = substr($duration, -1);

        return match ($unit) {
            's' => $value,
            'm' => $value * 60,
            'h' => $value * 3600,
            'd' => $value * 86400,
            'w' => $value * 604800,
            'M' => $value * 2592000, // 30 days
            'y' => $value * 31536000, // 365 days
            default => 3600, // Default to 1 hour
        };
    }
}
