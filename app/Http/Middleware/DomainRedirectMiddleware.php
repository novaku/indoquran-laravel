<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class DomainRedirectMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Skip redirect dalam environment local/development
        if (app()->environment(['local', 'development', 'testing'])) {
            return $next($request);
        }
        
        $host = $request->getHost();
        
        // Redirect all subdomains (mail.indoquran.web.id, my.indoquran.web.id, www.indoquran.web.id, etc.)
        // to primary canonical domain: indoquran.web.id
        if ($host !== 'indoquran.web.id') {
            $path = $request->getRequestUri(); // Already includes query string
            $newUrl = 'https://indoquran.web.id' . $path;
            
            // Redirect with status 301 (permanent redirect) and signal search bots not to index redirect URL.
            return redirect($newUrl, 301)
                ->header('X-Robots-Tag', 'noindex, nofollow');
        }
        
        return $next($request);
    }
}
