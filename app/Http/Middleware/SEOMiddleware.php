<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * SEO Middleware for comprehensive search engine optimization
 * Adds SEO headers and optimizations for better Google ranking
 */
class SEOMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only apply SEO headers to HTML responses
        if ($this->shouldApplySEOHeaders($request, $response)) {
            $this->addSEOHeaders($request, $response);
            $this->addSecurityHeaders($response);
            $this->addPerformanceHeaders($request, $response);

            // Conditional 304 Not Modified check for public pages
            $etag = $response->headers->get('ETag');
            if ($etag && $request->header('If-None-Match') === $etag) {
                return response('', 304)->withHeaders([
                    'Cache-Control' => $response->headers->get('Cache-Control'),
                    'ETag' => $etag,
                    'Expires' => $response->headers->get('Expires'),
                ]);
            }
        }

        return $response;
    }

    /**
     * Check if SEO headers should be applied
     */
    private function shouldApplySEOHeaders(Request $request, Response $response): bool
    {
        // Only apply to successful 200 OK responses
        if ($response->getStatusCode() !== 200 || $response->isRedirection()) {
            return false;
        }

        // Check if response is HTML
        $contentType = $response->headers->get('Content-Type', '');
        if (!str_contains($contentType, 'text/html') && !empty($contentType)) {
            return false;
        }

        // Don't apply to API routes
        if ($request->is('api/*')) {
            return false;
        }

        return true;
    }

    /**
     * Add comprehensive SEO headers
     */
    private function addSEOHeaders(Request $request, Response $response): void
    {
        $headers = [
            // Language and content optimization for Indonesian market
            'Content-Language' => 'id',
            'X-Content-Language' => 'id-ID',
            
            // Social media optimization
            'X-UA-Compatible' => 'IE=edge',
            
            // Geographic targeting for Indonesian users
            'X-Geographic-Location' => 'Indonesia',
            
            // Content optimization
            'Vary' => 'Accept-Encoding, User-Agent',
            
            // Site verification and ownership
            'X-Powered-By-IndoQuran' => 'Laravel-React-SEO-Optimized',
        ];

        foreach ($headers as $name => $value) {
            $response->headers->set($name, $value, false);
        }

        // Intelligent X-Robots-Tag: Noindex for parameter filter URLs and private routes
        if (!$response->headers->has('X-Robots-Tag')) {
            if ($request->hasAny(['q', 'tag', 'search', 'page', 'filter', 'sort']) || 
                $request->is(['masuk', 'daftar', 'profil', 'penanda', 'admin*', 'login', 'register'])) {
                $response->headers->set('X-Robots-Tag', 'noindex, follow');
            } else {
                $response->headers->set('X-Robots-Tag', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
            }
        }
    }

    /**
     * Add security headers for SEO trust signals
     */
    private function addSecurityHeaders(Response $response): void
    {
        $securityHeaders = [
            'X-Content-Type-Options' => 'nosniff',
            'X-Frame-Options' => 'DENY',
            'X-XSS-Protection' => '1; mode=block',
            'Referrer-Policy' => 'strict-origin-when-cross-origin',
            'Permissions-Policy' => 'geolocation=(), microphone=(), camera=()',
            'Strict-Transport-Security' => 'max-age=31536000; includeSubDomains; preload',
        ];

        foreach ($securityHeaders as $name => $value) {
            $response->headers->set($name, $value, false);
        }
    }

    /**
     * Add performance headers for Core Web Vitals optimization
     */
    private function addPerformanceHeaders(Request $request, Response $response): void
    {
        // Check if route is a private/user route or authenticated
        $isPrivateRoute = $request->is(['masuk', 'daftar', 'profil', 'penanda', 'admin*', 'login', 'register']) 
            || Auth::check() 
            || Auth::guard('api')->check();

        if ($isPrivateRoute) {
            $response->headers->set('Cache-Control', 'no-cache, no-store, must-revalidate, private', true);
            $response->headers->set('Pragma', 'no-cache', true);
        } else {
            // Public HTML caching: 1 hour browser cache + 24 hours stale-while-revalidate
            $cacheTime = 3600;
            $etag = '"' . md5($response->getContent()) . '"';

            $response->headers->set('Cache-Control', "public, max-age={$cacheTime}, stale-while-revalidate=86400", true);
            $response->headers->set('ETag', $etag, true);
            $response->headers->set('Expires', gmdate('D, d M Y H:i:s', time() + $cacheTime) . ' GMT', true);
            $response->headers->set('Last-Modified', gmdate('D, d M Y H:i:s') . ' GMT', true);
        }

        // Add resource hints for critical resources
        $preloadLinks = [
            // DNS prefetch for external resources only
            '<//fonts.googleapis.com>; rel=dns-prefetch',
            '<//www.google-analytics.com>; rel=dns-prefetch',
        ];

        $response->headers->set('Link', implode(', ', $preloadLinks), false);

        // Add timing headers for performance monitoring
        $startTime = defined('LARAVEL_START') ? LARAVEL_START : (defined('\LARAVEL_START') ? \LARAVEL_START : microtime(true));
        $response->headers->set('Server-Timing', 'app;dur=' . (microtime(true) - $startTime) * 1000);
    }
}
