import { useEffect } from 'react';

// Global set to track preloaded resources to prevent duplicates
const preloadedResources = new Set();

/**
 * Hook for preloading critical resources and routes
 * This helps improve perceived performance by loading resources before they're needed
 */
export const usePreloader = () => {
  useEffect(() => {
    const preloadResources = () => {
      // Check connection quality
      const isSlowConnection = 'connection' in navigator && 
        (navigator.connection.effectiveType === '2g' || 
         navigator.connection.effectiveType === 'slow-2g' ||
         navigator.connection.downlink < 1.5);

      if (isSlowConnection) {
        console.log('Slow connection detected, reducing preloading');
        // On slow connections, only preload critical API endpoints
        const criticalEndpoints = ['/api/surahs'];
        
        criticalEndpoints.forEach(endpoint => {
          if (preloadedResources.has(endpoint)) return;
          
          const link = document.createElement('link');
          link.rel = 'prefetch';
          link.href = endpoint;
          
          link.onload = () => {
            console.log(`Preloaded: ${endpoint}`);
          };
          
          link.onerror = () => {
            console.warn(`Failed to preload: ${endpoint}`);
          };
          
          document.head.appendChild(link);
          preloadedResources.add(endpoint);
        });
        return;
      }

      // Full preloading for fast connections
      const criticalEndpoints = [
        '/api/surahs',
        '/api/prayer-times'
      ];

      criticalEndpoints.forEach(endpoint => {
        if (preloadedResources.has(endpoint)) return;
        
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = endpoint;
        
        link.onload = () => {
          console.log(`Preloaded: ${endpoint}`);
        };
        
        link.onerror = () => {
          console.warn(`Failed to preload: ${endpoint}`);
        };
        
        document.head.appendChild(link);
        preloadedResources.add(endpoint);
      });

      // Don't preload fonts to avoid unused preload warnings
      // Fonts are loaded on-demand when they're actually used
      const fonts = [];

      fonts.forEach(fontUrl => {
        if (preloadedResources.has(fontUrl)) return;
        
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = fontUrl;
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
        
        link.onload = () => {
          console.log(`Preloaded font: ${fontUrl}`);
        };
        
        link.onerror = () => {
          console.warn(`Failed to preload font: ${fontUrl}`);
        };
        
        document.head.appendChild(link);
        preloadedResources.add(fontUrl);
      });

      // Skip image preloading to avoid unused preload warnings
      // Images will be loaded on-demand when needed
      // This prevents preload warnings for resources not used immediately
      const images = [];

      images.forEach(imageUrl => {
        if (preloadedResources.has(imageUrl)) return;
        
        // Check if image exists before preloading
        fetch(imageUrl, { method: 'HEAD' })
          .then(response => {
            if (response.ok) {
              const link = document.createElement('link');
              link.rel = 'preload';
              link.href = imageUrl;
              link.as = 'image';
              
              link.onload = () => {
                // Silent preload completion
                // console.log(`Preloaded: ${imageUrl}`);
              };
              
              link.onerror = () => {
                console.warn(`Failed to preload: ${imageUrl}`);
              };
              
              document.head.appendChild(link);
              preloadedResources.add(imageUrl);
            }
          })
          .catch(() => {
            console.warn(`Image not found, skipping preload: ${imageUrl}`);
          });
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
      // Check if user is on a slow connection
      const isSlowConnection = 'connection' in navigator && 
        (navigator.connection.effectiveType === '2g' || 
         navigator.connection.effectiveType === 'slow-2g' ||
         navigator.connection.downlink < 1.5);

      if (isSlowConnection) {
        console.log('Slow connection detected, reducing route prefetching');
        return;
      }

      // Import commonly accessed pages for prefetching
      const commonRoutes = [
        () => import('../pages/SurahPage'),
        () => import('../pages/SearchPage'),
        () => import('../pages/BookmarksPage'),
        () => import('../pages/JuzListPage'),
        () => import('../pages/PageListPage')
      ];

      // Prefetch after main content is loaded
      commonRoutes.forEach((importRoute, index) => {
        // Use requestIdleCallback if available, otherwise setTimeout
        const scheduleImport = (callback) => {
          if ('requestIdleCallback' in window) {
            requestIdleCallback(callback, { timeout: 5000 });
          } else {
            setTimeout(callback, 100 * (index + 1));
          }
        };

        scheduleImport(() => {
          importRoute().catch(() => {
            // Silently handle prefetch errors
          });
        });
      });
    };

    // Delay prefetching to prioritize initial load
    const timer = setTimeout(prefetchRoutes, 3000); // Increased delay
    return () => clearTimeout(timer);
  }, []);
};

/**
 * Performance monitoring hook
 * Tracks key performance metrics for optimization
 */
export const usePerformanceMonitor = () => {
  useEffect(() => {
    const trackPerformance = () => {        // Track First Contentful Paint
        if ('performance' in window && 'getEntriesByType' in performance) {
          const paintEntries = performance.getEntriesByType('paint');
          paintEntries.forEach(entry => {
            if (entry.name === 'first-contentful-paint') {
              // Silent FCP tracking - console logging disabled to reduce noise
              // console.log(`FCP: ${Math.round(entry.startTime)}ms`);
            }
          });

          // Track Largest Contentful Paint
          if ('PerformanceObserver' in window) {
            try {
              const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                  if (entry.entryType === 'largest-contentful-paint') {
                    console.log(`LCP: ${Math.round(entry.startTime)}ms`);
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
