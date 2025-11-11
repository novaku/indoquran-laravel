<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Surah;

class SetProperHttpStatus
{
    /**
     * Handle an incoming request and set proper HTTP status codes
     * to prevent soft 404 errors in Google Search Console.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Get the response first
        $response = $next($request);
        
        // Only process HTML responses (not API routes, assets, or build files)
        if (!str_starts_with($request->path(), 'api/') && 
            !str_starts_with($request->path(), 'build/') &&
            !str_starts_with($request->path(), 'assets/') &&
            !str_starts_with($request->path(), 'fonts/') &&
            !str_starts_with($request->path(), 'images/')) {
            
            $path = $request->path();
            $segments = explode('/', $path);
            
            // Check if this is a potentially invalid route that should return 404
            $shouldReturn404 = false;
            
            // Check for common attack patterns and invalid paths
            $attackPatterns = [
                'wp-admin', 'wp-login', 'wp-content', 'wp-includes', 'xmlrpc.php',
                'administrator', 'phpmyadmin', '.env', '.git', 'config.php',
                '.well-known', 'vendor', 'node_modules', '.htaccess', 'composer.json',
                'package.json', 'yarn.lock', 'composer.lock'
            ];
            
            foreach ($attackPatterns as $pattern) {
                if (stripos($path, $pattern) !== false) {
                    $shouldReturn404 = true;
                    break;
                }
            }
            
            // Check for file extensions that shouldn't exist in routes
            if (preg_match('/\.(php|asp|aspx|jsp|cgi|pl|py|rb|exe|dll|zip|rar|tar|gz)$/i', $path)) {
                $shouldReturn404 = true;
            }
            
            // Check invalid surah numbers
            if (isset($segments[0]) && $segments[0] === 'surah' && isset($segments[1]) && is_numeric($segments[1])) {
                $surahNumber = (int) $segments[1];
                if ($surahNumber < 1 || $surahNumber > 114) {
                    $shouldReturn404 = true;
                } elseif ($surahNumber > 0 && $surahNumber <= 114) {
                    // Verify surah exists in database (more reliable than range check alone)
                    $surah = Surah::where('number', $surahNumber)->first();
                    if (!$surah) {
                        $shouldReturn404 = true;
                    }
                }
            }
            
            // Check invalid juz numbers
            if (isset($segments[0]) && $segments[0] === 'juz' && isset($segments[1]) && is_numeric($segments[1])) {
                $juzNumber = (int) $segments[1];
                if ($juzNumber < 1 || $juzNumber > 30) {
                    $shouldReturn404 = true;
                }
            }
            
            // Check invalid page numbers
            if (isset($segments[0]) && $segments[0] === 'halaman' && isset($segments[1]) && is_numeric($segments[1])) {
                $pageNumber = (int) $segments[1];
                if ($pageNumber < 1 || $pageNumber > 604) {
                    $shouldReturn404 = true;
                }
            }
            
            // Set 404 status if route is invalid
            if ($shouldReturn404) {
                $response->setStatusCode(404);
                
                // Add X-Robots-Tag header to prevent indexing of 404 pages
                $response->headers->set('X-Robots-Tag', 'noindex, nofollow');
                $response->headers->set('Cache-Control', 'no-cache, no-store, must-revalidate');
            }
        }
        
        return $response;
    }
}
