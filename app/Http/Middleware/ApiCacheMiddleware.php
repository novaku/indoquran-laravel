<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
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
        $response = $next($request);
        
        // Only apply caching to successful GET requests
        if ($request->isMethod('GET') && $response->getStatusCode() === 200) {
            $cacheTime = $this->parseDuration($duration);
            $etag = '"' . md5($response->getContent()) . '"';
            
            // Handle conditional requests for 304 Not Modified
            $clientEtag = $request->header('If-None-Match');
            if ($clientEtag && $clientEtag === $etag) {
                return response('', 304)->withHeaders([
                    'Cache-Control' => "public, max-age={$cacheTime}",
                    'ETag' => $etag,
                    'Expires' => gmdate('D, d M Y H:i:s', time() + $cacheTime) . ' GMT',
                ]);
            }
            
            // Set comprehensive cache headers
            $response->headers->set('Cache-Control', "public, max-age={$cacheTime}", true);
            $response->headers->set('Expires', gmdate('D, d M Y H:i:s', time() + $cacheTime) . ' GMT', true);
            $response->headers->set('Last-Modified', gmdate('D, d M Y H:i:s') . ' GMT', true);
            $response->headers->set('ETag', $etag, true);
            
            // Remove potentially conflicting headers
            $response->headers->remove('pragma');
        }

        return $response;
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
