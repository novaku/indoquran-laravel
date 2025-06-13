// Resource Prefetching Utilities for IndoQuran

/**
 * Prefetch critical resources for improved performance
 */
export const prefetchResources = async () => {
  try {
    // Prefetch critical API endpoints
    const criticalEndpoints = [
      '/api/surahs',
      '/api/user', // If authenticated
    ];

    // Only prefetch if service worker is available
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      for (const endpoint of criticalEndpoints) {
        try {
          await fetch(endpoint, {
            method: 'GET',
            cache: 'default',
            credentials: 'include'
          });
        } catch (error) {
          // Silently fail for prefetch operations
          console.debug(`Prefetch failed for ${endpoint}:`, error);
        }
      }
    }

    // Prefetch critical fonts
    const criticalFonts = [
      '/fonts/arabic.woff2',
      '/fonts/inter.woff2'
    ];

    for (const font of criticalFonts) {
      try {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = font;
        link.as = 'font';
        link.type = 'font/woff2';
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      } catch (error) {
        console.debug(`Font prefetch failed for ${font}:`, error);
      }
    }

    // Prefetch critical images
    const criticalImages = [
      '/android-chrome-192x192.png',
      '/apple-touch-icon.png'
    ];

    for (const image of criticalImages) {
      try {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = image;
        link.as = 'image';
        document.head.appendChild(link);
      } catch (error) {
        console.debug(`Image prefetch failed for ${image}:`, error);
      }
    }

  } catch (error) {
    console.debug('Resource prefetch failed:', error);
  }
};

/**
 * Prefetch route components when user hovers over links
 */
export const prefetchRoute = (routePath) => {
  try {
    // This would integrate with your router's code splitting
    // For now, we'll just prefetch the associated API data
    const routeApiMap = {
      '/': '/api/surahs',
      '/surah': '/api/surahs',
      '/search': '/api/search',
      '/bookmarks': '/api/bookmarks',
      '/doa-bersama': '/api/doa-bersama'
    };

    const apiEndpoint = routeApiMap[routePath];
    if (apiEndpoint) {
      fetch(apiEndpoint, {
        method: 'HEAD', // Just check availability
        cache: 'default'
      }).catch(() => {
        // Silently fail
      });
    }
  } catch (error) {
    console.debug('Route prefetch failed:', error);
  }
};

/**
 * Smart image lazy loading with intersection observer
 */
export const setupImageLazyLoading = () => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });

    // Observe all images with data-src
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });

    return imageObserver;
  }
  return null;
};

/**
 * Preload critical CSS for the page
 */
export const preloadCriticalCSS = () => {
  try {
    const criticalStyles = [
      '/build/assets/app.css'
    ];

    criticalStyles.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = href;
      link.as = 'style';
      link.onload = function() {
        this.onload = null;
        this.rel = 'stylesheet';
      };
      document.head.appendChild(link);
    });
  } catch (error) {
    console.debug('CSS preload failed:', error);
  }
};

/**
 * Setup resource hints for better performance
 */
export const setupResourceHints = () => {
  try {
    // DNS prefetch for external domains
    const externalDomains = [
      '//fonts.googleapis.com',
      '//fonts.gstatic.com'
    ];

    externalDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    });

    // Preconnect to critical third-party domains
    const preconnectDomains = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com'
    ];

    preconnectDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = domain;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });

  } catch (error) {
    console.debug('Resource hints setup failed:', error);
  }
};

// Initialize resource optimization
export const initializeResourceOptimization = () => {
  // Setup on DOM content loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setupResourceHints();
      setupImageLazyLoading();
      preloadCriticalCSS();
    });
  } else {
    setupResourceHints();
    setupImageLazyLoading();
    preloadCriticalCSS();
  }

  // Setup prefetching after a short delay
  setTimeout(() => {
    prefetchResources();
  }, 1000);
};
