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
        /* Critical CSS for above-the-fold content - Optimized for Core Web Vitals */
        * { box-sizing: border-box; }
        
        body { 
            margin: 0; 
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            font-display: swap;
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeSpeed;
        }
        
        /* Prevent FOUT and layout shifts */
        .font-arabic { font-display: swap; }
        img { max-width: 100%; height: auto; }
        
        /* Critical loading screen - Optimized */
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
            contain: layout style paint;
        }
        
        .loader { 
            width: 40px; 
            height: 40px; 
            border: 3px solid #f3f4f6; 
            border-top: 3px solid #22c55e; 
            border-radius: 50%; 
            animation: spin 1s linear infinite;
            will-change: transform;
        }
        
        @keyframes spin { 
            0% { transform: rotate(0deg); } 
            100% { transform: rotate(360deg); } 
        }
        
        /* Prevent layout shift for header and main content */
        .header-placeholder { 
            height: 64px; 
            background: #ffffff;
        }
        
        .main-content { 
            min-height: calc(100vh - 64px);
            contain: layout;
        }
        
        /* Critical navigation styles */
        .nav-container {
            background: #ffffff;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
        }
        
        /* Optimize animations for performance */
        .animate-spin {
            will-change: transform;
        }
        
        /* Reduce paint complexity */
        .gpu-accelerated {
            transform: translateZ(0);
            will-change: transform;
        }
        
        /* Critical responsive breakpoints */
        @media (max-width: 768px) {
            .header-placeholder { height: 56px; }
            .main-content { min-height: calc(100vh - 56px); }
        }
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
