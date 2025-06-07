<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ContentSecurityPolicy
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        
        // Development CSP (more permissive for hot reload)
        if (app()->environment('local')) {
            $csp = implode('; ', [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: http://localhost:5173 ws://localhost:5173 https://*.google-analytics.com https://www.google-analytics.com",
                "style-src 'self' 'unsafe-inline' blob: data: http://localhost:5173 https://fonts.bunny.net https://fonts.googleapis.com",
                "font-src 'self' data: blob: https://fonts.bunny.net https://fonts.gstatic.com",
                "img-src 'self' data: blob: https://*.google-analytics.com https://www.google-analytics.com",
                "media-src 'self' https://*.nos.wjv-1.neo.id https://*.equran.id https://*.equran.nos.wjv-1.neo.id https://*.quranicaudio.com https://*.qurancdn.com https://*.vercel.app *",
                "connect-src 'self' ws://localhost:5173 http://localhost:5173 https://download.quranicaudio.com https://nominatim.openstreetmap.org https://*.google-analytics.com https://www.google-analytics.com",
                "worker-src 'self' blob:",
                "child-src 'self' blob:",
            ]);
        } else {
            // Production CSP (more restrictive)
            $csp = implode('; ', [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://*.infird.com https://infird.com https://*.google-analytics.com https://www.google-analytics.com",
                "style-src 'self' 'unsafe-inline' https://fonts.bunny.net https://fonts.googleapis.com",
                "font-src 'self' data: blob: https://fonts.bunny.net https://fonts.gstatic.com",
                "img-src 'self' data: blob: https://*.google-analytics.com https://www.google-analytics.com",
                "media-src 'self' https://*.nos.wjv-1.neo.id https://*.equran.id https://*.equran.nos.wjv-1.neo.id https://*.quranicaudio.com https://*.qurancdn.com https://*.vercel.app *",
                "connect-src 'self' https://download.quranicaudio.com https://*.infird.com https://infird.com https://nominatim.openstreetmap.org https://*.google-analytics.com https://www.google-analytics.com",
                "worker-src 'self' blob:",
                "child-src 'self' blob:",
            ]);
        }
        
        $response->headers->set('Content-Security-Policy', $csp);
        
        return $response;
    }
}
