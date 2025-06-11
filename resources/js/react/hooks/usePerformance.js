import { useEffect } from 'react';

/**
 * Hook for preloading critical resources and routes
 * This helps improve perceived performance by loading resources before they're needed
 */
export const usePreloader = () => {
  useEffect(() => {
    const preloadResources = () => {
      // Preload critical API endpoints
      const criticalEndpoints = [
        '/api/surahs',
        '/api/prayer-times'
      ];

      criticalEndpoints.forEach(endpoint => {
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = endpoint;
        document.head.appendChild(link);
      });

      // Preload critical fonts
      const fonts = [
        '/fonts/arabic-font.woff2',
        '/fonts/indonesian-font.woff2'
      ];

      fonts.forEach(fontUrl => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = fontUrl;
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      });
    };

    // Delay preloading to avoid blocking initial render
    const timer = setTimeout(preloadResources, 1000);
    return () => clearTimeout(timer);
  }, []);
};

/**
 * Hook for prefetching route components
 * Prefetches commonly accessed route components for faster navigation
 */
export const usePrefetchRoutes = () => {
  useEffect(() => {
    const prefetchRoutes = () => {
      // Import commonly accessed pages for prefetching
      const commonRoutes = [
        () => import('../pages/SurahPage'),
        () => import('../pages/SearchPage'),
        () => import('../pages/BookmarksPage')
      ];

      // Prefetch after main content is loaded
      commonRoutes.forEach(importRoute => {
        requestIdleCallback(() => {
          importRoute().catch(() => {
            // Silently handle prefetch errors
          });
        });
      });
    };

    // Delay prefetching to prioritize initial load
    const timer = setTimeout(prefetchRoutes, 2000);
    return () => clearTimeout(timer);
  }, []);
};

/**
 * Performance monitoring hook
 * Tracks key performance metrics for optimization
 */
export const usePerformanceMonitor = () => {
  useEffect(() => {
    const trackPerformance = () => {
      // Track First Contentful Paint
      if ('performance' in window && 'getEntriesByType' in performance) {
        const paintEntries = performance.getEntriesByType('paint');
        paintEntries.forEach(entry => {
          if (entry.name === 'first-contentful-paint') {
            console.log(`FCP: ${entry.startTime}ms`);
          }
        });

        // Track Largest Contentful Paint
        if ('PerformanceObserver' in window) {
          try {
            const observer = new PerformanceObserver((list) => {
              const entries = list.getEntries();
              entries.forEach(entry => {
                if (entry.entryType === 'largest-contentful-paint') {
                  console.log(`LCP: ${entry.startTime}ms`);
                }
              });
            });
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
          } catch (e) {
            // Silently handle unsupported browsers
          }
        }
      }
    };

    // Track performance after initial load
    const timer = setTimeout(trackPerformance, 1000);
    return () => clearTimeout(timer);
  }, []);
};

export default {
  usePreloader,
  usePrefetchRoutes,
  usePerformanceMonitor
};
