<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
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
            $this->addPerformanceHeaders($response);
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
    private function addPerformanceHeaders(Response $response): void
    {
        // Set cache headers for better performance
        if (!$response->headers->has('Cache-Control')) {
            $response->headers->set('Cache-Control', 'public, max-age=3600, must-revalidate');
        }

        // Add resource hints for critical resources
        // Note: Don't preload app.js/app.css as they have hashed filenames
        // Vite handles this automatically via @vite directive
        // REMOVED: Icon preload - not critical for initial render, causes "not used" warnings
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
