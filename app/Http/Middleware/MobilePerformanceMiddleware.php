<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class MobilePerformanceMiddleware
{
    /**
     * Handle an incoming request with mobile performance optimizations
     */
    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // Only apply to HTML responses
        if (!$this->isHtmlResponse($response)) {
            return $response;
        }

        // Add mobile performance headers
        $this->addPerformanceHeaders($response, $request);

        // Add resource hints for mobile
        $this->addResourceHints($response, $request);

        // Track performance metrics
        $this->trackPerformanceMetrics($request);

        return $response;
    }

    /**
     * Check if response is HTML
     */
    private function isHtmlResponse($response): bool
    {
        $contentType = $response->headers->get('Content-Type', '');
        return str_contains($contentType, 'text/html');
    }

    /**
     * Add performance-related headers for mobile optimization
     */
    private function addPerformanceHeaders($response, $request): void
    {
        // Enable compression
        $response->headers->set('Vary', 'Accept-Encoding, User-Agent');

        // Cache control for mobile browsers
        if ($this->isMobileRequest($request)) {
            $response->headers->set('Cache-Control', 'public, max-age=300, stale-while-revalidate=86400');
        }

        // Add timing allow origin for better performance monitoring
        $response->headers->set('Timing-Allow-Origin', '*');

        // Add feature policy for better mobile performance
        $response->headers->set('Permissions-Policy', 
            'geolocation=(self), ' .
            'camera=(), ' .
            'microphone=(), ' .
            'payment=(), ' .
            'accelerometer=(), ' .
            'gyroscope=(), ' .
            'magnetometer=()'
        );

        // Add critical resource hints
        $response->headers->set('Link', 
            '</build/assets/vendor-react.js>; rel=modulepreload; as=script, ' .
            '</build/assets/app.css>; rel=preload; as=style, ' .
            '<https://fonts.googleapis.com>; rel=preconnect'
        );
    }

    /**
     * Add mobile-specific resource hints
     */
    private function addResourceHints($response, $request): void
    {
        if (!$this->isMobileRequest($request)) {
            return;
        }

        $content = $response->getContent();
        
        // Add mobile-specific preload hints
        $mobileHints = $this->getMobileResourceHints($request);
        
        // Inject hints before closing head tag
        $content = str_replace('</head>', $mobileHints . '</head>', $content);
        
        $response->setContent($content);
    }

    /**
     * Generate mobile-specific resource hints
     */
    private function getMobileResourceHints($request): string
    {
        $hints = [];
        
        // Preload critical mobile resources
        $hints[] = '<link rel="preload" href="/build/assets/vendor-react.js" as="script" crossorigin>';
        $hints[] = '<link rel="preload" href="/build/assets/app.css" as="style">';
        
        // DNS prefetch for external resources
        $hints[] = '<link rel="dns-prefetch" href="//fonts.googleapis.com">';
        $hints[] = '<link rel="dns-prefetch" href="//fonts.gstatic.com">';
        
        // Connection-aware preloading
        if ($this->isFastConnection($request)) {
            $hints[] = '<link rel="prefetch" href="/api/surahs">';
            $hints[] = '<link rel="preload" href="/build/assets/vendor-ui.js" as="script" crossorigin>';
        }

        return implode("\n", $hints);
    }

    /**
     * Detect if request is from mobile device
     */
    private function isMobileRequest($request): bool
    {
        $userAgent = $request->header('User-Agent', '');
        
        return preg_match('/Mobile|Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i', $userAgent);
    }

    /**
     * Detect fast connection (rough estimation)
     */
    private function isFastConnection($request): bool
    {
        // Check for connection hints from client
        $saveData = $request->header('Save-Data', 'off');
        $networkInfo = $request->header('Downlink', '10'); // Default to fast connection
        
        return $saveData !== 'on' && floatval($networkInfo) > 1.5;
    }

    /**
     * Track performance metrics for analysis
     */
    private function trackPerformanceMetrics($request): void
    {
        try {
            $metrics = [
                'timestamp' => now(),
                'url' => $request->fullUrl(),
                'user_agent' => $request->header('User-Agent'),
                'is_mobile' => $this->isMobileRequest($request),
                'save_data' => $request->header('Save-Data', 'off') === 'on',
                'memory_usage' => memory_get_peak_usage(true),
                'execution_time' => microtime(true) - LARAVEL_START,
            ];

            // Store metrics for analysis (rotate daily)
            $key = 'mobile_performance_' . date('Y-m-d');
            $existing = Cache::get($key, []);
            $existing[] = $metrics;
            
            // Keep only last 100 entries per day to limit memory usage
            if (count($existing) > 100) {
                $existing = array_slice($existing, -100);
            }
            
            Cache::put($key, $existing, now()->addDays(7));
            
        } catch (\Exception $e) {
            Log::warning('Failed to track mobile performance metrics', [
                'error' => $e->getMessage(),
                'url' => $request->fullUrl()
            ]);
        }
    }
}
