<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ExcludeSSLErrorsMiddleware
{
    /**
     * Handle an incoming request and filter out SSL-related errors in local development.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Illuminate\Http\Response|\Illuminate\Http\RedirectResponse)  $next
     * @return \Illuminate\Http\Response|\Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request, Closure $next)
    {
        // Only apply this middleware in local development environment
        if (app()->environment('local')) {
            // Check if this is a malformed SSL request
            $userAgent = $request->header('User-Agent', '');
            
            // Detect potential SSL probes or invalid SSL requests
            $isSSLProbe = $this->isSSLProbeRequest($request);
            
            if ($isSSLProbe) {
                // Simply return an empty response without logging
                // This prevents SSL handshake errors from propagating
                return response('', 400, [
                    'Connection' => 'close',
                    'Content-Type' => 'text/plain'
                ]);
            }
        }

        return $next($request);
    }

    /**
     * Determine if this is an SSL probe or invalid SSL request
     *
     * @param Request $request
     * @return bool
     */
    private function isSSLProbeRequest(Request $request): bool
    {
        // Check for common SSL probe characteristics
        $userAgent = $request->header('User-Agent', '');
        $method = $request->method();
        $host = $request->header('Host', '');
        $acceptHeader = $request->header('Accept', '');
        
        // Don't block normal browser requests
        if (str_contains($userAgent, 'Mozilla') || 
            str_contains($userAgent, 'Chrome') || 
            str_contains($userAgent, 'Safari') || 
            str_contains($userAgent, 'Edge') ||
            str_contains($userAgent, 'curl') && !empty($acceptHeader)) {
            return false;
        }
        
        // Common SSL probe patterns
        $sslProbePatterns = [
            // Empty or malformed requests with no user agent
            empty($userAgent) && empty($acceptHeader),
            
            // CONNECT method (often used for SSL tunneling)
            $method === 'CONNECT',
            
            // Requests with binary data in headers (SSL handshake attempts)
            $this->containsBinaryData($request),
            
            // SSL scanner user agents
            stripos($userAgent, 'ssl') !== false && !str_contains($userAgent, 'Mozilla'),
            stripos($userAgent, 'scanner') !== false,
            stripos($userAgent, 'probe') !== false,
        ];

        return in_array(true, $sslProbePatterns, true);
    }

    /**
     * Check if request contains binary data (potential SSL handshake)
     *
     * @param Request $request
     * @return bool
     */
    private function containsBinaryData(Request $request): bool
    {
        // Check if any header contains non-printable characters
        foreach ($request->headers->all() as $name => $values) {
            foreach ($values as $value) {
                if (preg_match('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', $value)) {
                    return true;
                }
            }
        }
        
        return false;
    }
}
