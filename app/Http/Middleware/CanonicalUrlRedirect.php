<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CanonicalUrlRedirect
{
    /**
     * Middleware untuk enforce canonical URL
     * Menangani:
     * - Trailing slash removal
     * - Tracking parameter removal
     * - Protocol enforcement (HTTPS)
     * - www subdomain removal
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip for API routes
        if ($request->is('api/*')) {
            return $next($request);
        }

        // Skip for admin routes
        if ($request->is('admin/*')) {
            return $next($request);
        }

        $needsRedirect = false;
        $path = $request->path();
        $query = $request->query();

        // 1. Remove trailing slash (except for root)
        if ($path !== '/' && str_ends_with($path, '/')) {
            $path = rtrim($path, '/');
            $needsRedirect = true;
        }

        // 2. Remove tracking parameters
        $trackingParams = [
            'utm_source',
            'utm_medium',
            'utm_campaign',
            'utm_term',
            'utm_content',
            'ref',
            'fbclid',
            'gclid',
            'msclkid',
            '_ga',
            '_gid',
        ];

        $cleanedQuery = [];
        $removedParams = false;

        foreach ($query as $key => $value) {
            if (!in_array($key, $trackingParams)) {
                $cleanedQuery[$key] = $value;
            } else {
                $removedParams = true;
            }
        }

        if ($removedParams) {
            $needsRedirect = true;
            $query = $cleanedQuery;
        }

        // 3. Force HTTPS (jika belum)
        if (!$request->secure() && app()->environment('production')) {
            $needsRedirect = true;
        }

        // 4. Force non-www
        if (str_starts_with($request->getHost(), 'www.')) {
            $needsRedirect = true;
        }

        // Perform redirect if needed
        if ($needsRedirect) {
            $url = $this->buildCanonicalUrl($path, $query);

            // Keep redirects clean: avoid sending noindex on redirect responses.
            // Canonical target pages already define their own index directives.
            return redirect($url, 301);
        }

        return $next($request);
    }

    /**
     * Build canonical URL
     *
     * @param string $path
     * @param array $query
     * @return string
     */
    private function buildCanonicalUrl(string $path, array $query): string
    {
        // Base URL always canonical production domain
        $baseUrl = app()->environment('production') ? 'https://indoquran.web.id' : config('app.url');
        $baseUrl = str_replace('www.', '', $baseUrl);
        $baseUrl = rtrim($baseUrl, '/');

        // Normalize path
        if ($path === 'home' || $path === '') {
            $path = '/';
        } elseif (!str_starts_with($path, '/')) {
            $path = '/' . $path;
        }

        // Build URL
        $url = $baseUrl . $path;

        // Add query parameters if any
        if (!empty($query)) {
            $url .= '?' . http_build_query($query);
        }

        return $url;
    }
}
