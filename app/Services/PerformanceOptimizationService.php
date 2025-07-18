<?php

namespace App\Services;

class PerformanceOptimizationService
{
    /**
     * Get critical CSS inline for above-the-fold content
     */
    public static function getCriticalCSS()
    {
        return '
        <style>
        /* Critical CSS for above-the-fold content */
        body { margin: 0; font-family: Inter, system-ui, sans-serif; }
        .loading-screen { 
            position: fixed; 
            top: 0; 
            left: 0; 
            width: 100%; 
            height: 100%; 
            background: #ffffff; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            z-index: 9999; 
        }
        .loader { 
            width: 40px; 
            height: 40px; 
            border: 4px solid #f3f3f3; 
            border-top: 4px solid #22c55e; 
            border-radius: 50%; 
            animation: spin 1s linear infinite; 
        }
        @keyframes spin { 
            0% { transform: rotate(0deg); } 
            100% { transform: rotate(360deg); } 
        }
        /* Prevent layout shift */
        .header-placeholder { height: 80px; }
        .main-content { min-height: calc(100vh - 80px); }
        /* Font loading optimization */
        .font-arabic { font-display: swap; }
        </style>';
    }

    /**
     * Get resource hints for preloading
     */
    public static function getResourceHints()
    {
        return [
            'preconnect' => [
                'https://fonts.googleapis.com',
                'https://fonts.gstatic.com',
                'https://fonts.bunny.net',
            ],
            'dns-prefetch' => [
                'https://api.indoquran.web.id',
            ],
            'preload' => [
                // Add critical resources that should be preloaded
            ]
        ];
    }

    /**
     * Minify HTML output
     */
    public static function minifyHTML($html)
    {
        // Remove unnecessary whitespace and comments
        $html = preg_replace('/<!--(?!<!)[^\[>].*?-->/s', '', $html);
        $html = preg_replace('/\s+/', ' ', $html);
        $html = preg_replace('/>\s+</', '><', $html);
        
        return trim($html);
    }

    /**
     * Generate performance monitoring script
     */
    public static function getPerformanceMonitoringScript()
    {
        return "
        <script>
        // Web Vitals monitoring
        (function() {
            // Monitor Core Web Vitals
            function getCLS(onPerfEntry) {
                if (onPerfEntry && onPerfEntry instanceof Function && 'PerformanceObserver' in window) {
                    let clsValue = 0;
                    let clsEntries = [];
                    let sessionValue = 0;
                    let sessionEntries = [];
                    
                    new PerformanceObserver((entryList) => {
                        for (const entry of entryList.getEntries()) {
                            if (!entry.hadRecentInput) {
                                const firstSessionEntry = sessionEntries[0];
                                const lastSessionEntry = sessionEntries[sessionEntries.length - 1];
                                
                                if (sessionValue && entry.startTime - lastSessionEntry.startTime < 1000 && entry.startTime - firstSessionEntry.startTime < 5000) {
                                    sessionValue += entry.value;
                                    sessionEntries.push(entry);
                                } else {
                                    sessionValue = entry.value;
                                    sessionEntries = [entry];
                                }
                                
                                if (sessionValue > clsValue) {
                                    clsValue = sessionValue;
                                    clsEntries = [...sessionEntries];
                                    onPerfEntry({ name: 'CLS', value: clsValue, entries: clsEntries });
                                }
                            }
                        }
                    }).observe({ type: 'layout-shift', buffered: true });
                }
            }
            
            function getFCP(onPerfEntry) {
                if (onPerfEntry && onPerfEntry instanceof Function && 'PerformanceObserver' in window) {
                    new PerformanceObserver((entryList) => {
                        for (const entry of entryList.getEntries()) {
                            if (entry.name === 'first-contentful-paint') {
                                onPerfEntry({ name: 'FCP', value: entry.startTime, entry });
                            }
                        }
                    }).observe({ type: 'paint', buffered: true });
                }
            }
            
            function getLCP(onPerfEntry) {
                if (onPerfEntry && onPerfEntry instanceof Function && 'PerformanceObserver' in window) {
                    new PerformanceObserver((entryList) => {
                        const entries = entryList.getEntries();
                        const lastEntry = entries[entries.length - 1];
                        onPerfEntry({ name: 'LCP', value: lastEntry.startTime, entry: lastEntry });
                    }).observe({ type: 'largest-contentful-paint', buffered: true });
                }
            }
            
            // Log performance metrics
            const logMetric = (metric) => {
                console.log(\`Performance metric - \${metric.name}: \${metric.value}\`);
                
                // Send to analytics if needed
                if (window.gtag) {
                    gtag('event', metric.name, {
                        event_category: 'Web Vitals',
                        value: Math.round(metric.value),
                        non_interaction: true,
                    });
                }
            };
            
            // Initialize monitoring
            getCLS(logMetric);
            getFCP(logMetric);
            getLCP(logMetric);
            
            // Monitor page load
            window.addEventListener('load', () => {
                const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                console.log(\`Page load time: \${loadTime}ms\`);
            });
        })();
        </script>";
    }

    /**
     * Get optimized loading screen
     */
    public static function getLoadingScreen()
    {
        return '
        <div id="loading-screen" class="loading-screen">
            <div class="loader"></div>
        </div>
        <script>
        // Hide loading screen when page is loaded
        window.addEventListener("load", function() {
            const loadingScreen = document.getElementById("loading-screen");
            if (loadingScreen) {
                loadingScreen.style.opacity = "0";
                setTimeout(() => {
                    loadingScreen.style.display = "none";
                }, 300);
            }
        });
        
        // Fallback: hide loading screen after 3 seconds
        setTimeout(function() {
            const loadingScreen = document.getElementById("loading-screen");
            if (loadingScreen && loadingScreen.style.display !== "none") {
                loadingScreen.style.display = "none";
            }
        }, 3000);
        </script>';
    }
}
