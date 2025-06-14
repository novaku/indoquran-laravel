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
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: https://my.indoquran.web.id http://localhost:5173 http://127.0.0.1:5173 http://localhost:5174 http://127.0.0.1:5174 http://localhost:8000 http://127.0.0.1:8000 http://localhost ws://localhost:5173 ws://127.0.0.1:5173 ws://localhost:5174 ws://127.0.0.1:5174 https://*.google-analytics.com https://www.google-analytics.com https://www.googletagmanager.com https://tagmanager.google.com https://analytics.google.com https://*.googlesyndication.com https://*.google.com https://cdn.jsdelivr.net https://unpkg.com",
                "script-src-elem 'self' 'unsafe-inline' 'unsafe-eval' blob: data: https://my.indoquran.web.id http://localhost:5173 http://127.0.0.1:5173 http://localhost:5174 http://127.0.0.1:5174 http://localhost:8000 http://127.0.0.1:8000 http://localhost ws://localhost:5173 ws://127.0.0.1:5173 ws://localhost:5174 ws://127.0.0.1:5174 https://*.google-analytics.com https://www.google-analytics.com https://www.googletagmanager.com https://tagmanager.google.com https://analytics.google.com https://*.googlesyndication.com https://*.google.com https://cdn.jsdelivr.net https://unpkg.com",
                "style-src 'self' 'unsafe-inline' blob: data: https://my.indoquran.web.id http://localhost:5173 http://127.0.0.1:5173 http://localhost:5174 http://127.0.0.1:5174 http://localhost:8000 http://127.0.0.1:8000 http://localhost https://fonts.bunny.net https://fonts.googleapis.com https://cdn.jsdelivr.net",
                "font-src 'self' data: blob: http://localhost:8000 http://127.0.0.1:8000 http://localhost:5173 http://127.0.0.1:5173 http://localhost:5174 http://127.0.0.1:5174 http://localhost https://fonts.bunny.net https://fonts.gstatic.com https://my.indoquran.web.id https://cdn.jsdelivr.net",
                "img-src 'self' data: blob: https://*.google-analytics.com https://www.google-analytics.com https://*.googlesyndication.com https://*.google.com",
                "media-src 'self' https://*.nos.wjv-1.neo.id https://*.equran.id https://*.equran.nos.wjv-1.neo.id https://*.quranicaudio.com https://*.qurancdn.com https://*.vercel.app *",
                "connect-src 'self' ws://localhost:5173 ws://127.0.0.1:5173 ws://localhost:5174 ws://127.0.0.1:5174 http://localhost:5173 http://127.0.0.1:5173 http://localhost:5174 http://127.0.0.1:5174 http://localhost:8000 http://127.0.0.1:8000 http://localhost https://my.indoquran.web.id https://download.quranicaudio.com https://nominatim.openstreetmap.org https://*.google-analytics.com https://www.google-analytics.com https://www.googletagmanager.com https://tagmanager.google.com https://analytics.google.com https://cdn.jsdelivr.net",
                "worker-src 'self' blob: data:",
                "child-src 'self' blob: data:",
                "manifest-src 'self'",
            ]);
        } else {
            // Production CSP (more restrictive) - Block all external scripts except trusted sources
            $csp = implode('; ', [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: https://my.indoquran.web.id https://*.google-analytics.com https://www.google-analytics.com https://www.googletagmanager.com https://tagmanager.google.com https://analytics.google.com https://*.googlesyndication.com https://*.google.com",
                "script-src-elem 'self' 'unsafe-inline' 'unsafe-eval' blob: data: https://my.indoquran.web.id https://*.google-analytics.com https://www.google-analytics.com https://www.googletagmanager.com https://tagmanager.google.com https://analytics.google.com https://*.googlesyndication.com https://*.google.com",
                "style-src 'self' 'unsafe-inline' https://fonts.bunny.net https://fonts.googleapis.com",
                "font-src 'self' data: blob: https://fonts.bunny.net https://fonts.gstatic.com https://my.indoquran.web.id",
                "img-src 'self' data: blob: https://*.google-analytics.com https://www.google-analytics.com https://*.googlesyndication.com https://*.google.com",
                "media-src 'self' https://*.nos.wjv-1.neo.id https://*.equran.id https://*.equran.nos.wjv-1.neo.id https://*.quranicaudio.com https://*.qurancdn.com https://*.vercel.app *",
                "connect-src 'self' https://download.quranicaudio.com https://my.indoquran.web.id https://nominatim.openstreetmap.org https://*.google-analytics.com https://www.google-analytics.com https://www.googletagmanager.com https://tagmanager.google.com https://analytics.google.com",
                "worker-src 'self' blob:",
                "child-src 'self' blob:",
                "manifest-src 'self'",
                "frame-ancestors 'none'",
                "base-uri 'self'",
                "form-action 'self'",
                "upgrade-insecure-requests",
                "block-all-mixed-content"
            ]);
        }
        
        $response->headers->set('Content-Security-Policy', $csp);
        
        // Add additional security headers to prevent malware injection
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
        
        return $response;
    }
}
