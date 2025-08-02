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
        
        // Cek apakah domain adalah my.indoquran.web.id
        if ($host === 'my.indoquran.web.id') {
            // Bangun URL baru dengan domain indoquran.web.id
            // Gunakan scheme yang sama, ganti hanya domain, pertahankan path dan query
            $scheme = $request->getScheme();
            $path = $request->getRequestUri(); // Sudah termasuk query string
            $newUrl = $scheme . '://indoquran.web.id' . $path;
            
            // Redirect dengan status 301 (permanent redirect)
            return redirect($newUrl, 301);
        }
        
        // Jika bukan domain yang perlu di-redirect, lanjutkan request normal
        return $next($request);
    }
}
