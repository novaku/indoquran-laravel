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
        
        // Only process HTML responses (not API routes)
        if (!str_starts_with($request->path(), 'api/') && 
            !str_starts_with($request->path(), 'build/') &&
            !str_starts_with($request->path(), 'assets/')) {
            
            $path = $request->path();
            $segments = explode('/', $path);
            
            // Check if this is a potentially invalid route that should return 404
            $shouldReturn404 = false;
            
            // Check invalid surah numbers
            if (isset($segments[0]) && $segments[0] === 'surah' && isset($segments[1])) {
                $surahNumber = (int) $segments[1];
                if ($surahNumber < 1 || $surahNumber > 114) {
                    $shouldReturn404 = true;
                } elseif (is_numeric($segments[1])) {
                    // Verify surah exists in database
                    $surah = Surah::where('number', $surahNumber)->first();
                    if (!$surah) {
                        $shouldReturn404 = true;
                    }
                }
            }
            
            // Check invalid juz numbers
            if (isset($segments[0]) && $segments[0] === 'juz' && isset($segments[1])) {
                $juzNumber = (int) $segments[1];
                if ($juzNumber < 1 || $juzNumber > 30) {
                    $shouldReturn404 = true;
                }
            }
            
            // Check invalid page numbers
            if (isset($segments[0]) && $segments[0] === 'halaman' && isset($segments[1])) {
                $pageNumber = (int) $segments[1];
                if ($pageNumber < 1 || $pageNumber > 604) {
                    $shouldReturn404 = true;
                }
            }
            
            // Check for obviously invalid routes (random strings, old paths, etc.)
            $invalidPatterns = [
                '/wp-admin',
                '/wp-login',
                '/administrator',
                '/phpmyadmin',
                '/.env',
                '/.git',
                '/config',
                '/wp-content',
                '/xmlrpc.php',
                '/wp-includes',
            ];
            
            foreach ($invalidPatterns as $pattern) {
                if (str_starts_with('/' . $path, $pattern)) {
                    $shouldReturn404 = true;
                    break;
                }
            }
            
            // Set 404 status if route is invalid
            if ($shouldReturn404) {
                $response->setStatusCode(404);
            }
        }
        
        return $response;
    }
}
