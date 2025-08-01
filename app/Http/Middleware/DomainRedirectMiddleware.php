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
        // Ambil full URL saat ini
        $currentUrl = $request->fullUrl();
        $host = $request->getHost();
        
        // Cek apakah domain adalah my.indoquran.web.id
        if ($host === 'my.indoquran.web.id') {
            // Bangun URL baru dengan domain indoquran.web.id
            $newUrl = str_replace('://my.indoquran.web.id', '://indoquran.web.id', $currentUrl);
            
            // Redirect dengan status 301 (permanent redirect)
            return redirect($newUrl, 301);
        }
        
        // Jika bukan domain yang perlu di-redirect, lanjutkan request normal
        return $next($request);
    }
}
