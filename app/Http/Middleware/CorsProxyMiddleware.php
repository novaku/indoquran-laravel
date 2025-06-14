<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Symfony\Component\HttpFoundation\Response;

class CorsProxyMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Only run in development environment
        if (app()->environment('production')) {
            return $next($request);
        }

        // Check if this is a proxy request to our production site
        if ($request->is('proxy-assets/*')) {
            $path = $request->path();
            $targetPath = str_replace('proxy-assets/', '', $path);
            
            // Production domain - adjust as needed
            $productionDomain = 'https://my.indoquran.web.id';
            $targetUrl = $productionDomain . '/' . $targetPath;
            
            try {
                // Use Laravel's HTTP client with longer timeout and fewer redirects
                $response = Http::timeout(10)
                    ->withoutVerifying() // Skip SSL verification in development
                    ->withHeaders([
                        'User-Agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                        'Accept' => '*/*',
                        'Accept-Language' => 'en-US,en;q=0.9',
                        'Connection' => 'keep-alive',
                        'Origin' => url('/'),
                    ])
                    ->get($targetUrl);
                
                // Get content type based on file extension
                $contentType = $this->getContentTypeForFile($targetPath);
                
                // Return the proxied response
                return response($response->body(), $response->status())
                    ->header('Content-Type', $contentType)
                    ->header('Access-Control-Allow-Origin', '*')
                    ->header('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
            } catch (\Exception $e) {
                // Log the error
                \Log::error('CORS Proxy Error for ' . $targetUrl . ': ' . $e->getMessage());
                
                // Return a fallback response
                $contentType = $this->getContentTypeForFile($targetPath);
                $fallbackContent = '';
                
                if (str_ends_with($targetPath, '.js')) {
                    $fallbackContent = '/* Failed to load from production - fallback empty file */';
                } elseif (str_ends_with($targetPath, '.css')) {
                    $fallbackContent = '/* Failed to load CSS from production - fallback empty file */';
                }
                
                return response($fallbackContent, 503)
                    ->header('Content-Type', $contentType)
                    ->header('Access-Control-Allow-Origin', '*');
            }
        }

        return $next($request);
    }
    
    /**
     * Get the content type based on file extension
     *
     * @param string $path
     * @return string
     */
    private function getContentTypeForFile(string $path): string
    {
        if (str_ends_with($path, '.js')) {
            return 'application/javascript';
        } elseif (str_ends_with($path, '.css')) {
            return 'text/css';
        } elseif (str_ends_with($path, '.json')) {
            return 'application/json';
        } elseif (str_ends_with($path, '.png')) {
            return 'image/png';
        } elseif (str_ends_with($path, '.jpg') || str_ends_with($path, '.jpeg')) {
            return 'image/jpeg';
        } elseif (str_ends_with($path, '.svg')) {
            return 'image/svg+xml';
        } elseif (str_ends_with($path, '.woff2')) {
            return 'font/woff2';
        } elseif (str_ends_with($path, '.woff')) {
            return 'font/woff';
        } elseif (str_ends_with($path, '.ttf')) {
            return 'font/ttf';
        } elseif (str_ends_with($path, '.html')) {
            return 'text/html';
        }
        
        return 'text/plain';
    }
}
