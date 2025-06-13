import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Resource Preloader Hook
 * Intelligently preloads resources based on user behavior and route patterns
 */
export const useResourcePreloader = (config = {}) => {
  const {
    enableRoutePreloading = true,
    enableImagePreloading = true,
    enableFontPreloading = true,
    enableApiPreloading = true,
    preloadDelay = 2000,
    enableHoverPreloading = true,
    enableIntersectionPreloading = true
  } = config;

  const location = useLocation();
  const preloadedResources = useRef(new Set());
  const hoverTimeouts = useRef(new Map());

  // Preload a resource
  const preloadResource = useCallback((url, type = 'prefetch', as = null) => {
    if (preloadedResources.current.has(url)) return;

    const link = document.createElement('link');
    link.rel = type;
    link.href = url;
    
    if (as) {
      link.as = as;
      
      // For fonts, ensure they get used by triggering font loading
      if (as === 'font') {
        link.crossOrigin = 'anonymous';
        
        // Add font-display swap for better performance
        const style = document.createElement('style');
        const fontName = url.split('/').pop().split('.')[0];
        style.textContent = `
          @font-face {
            font-family: '${fontName}';
            src: url('${url}') format('woff2');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
          }
        `;
        document.head.appendChild(style);
        
        // Trigger font loading immediately to avoid unused preload warning
        if (document.fonts && document.fonts.load) {
          document.fonts.load(`1em ${fontName}`).catch(() => {
            // Silent fail for font loading
          });
        }
      }
    }
    
    if (as === 'font' && !link.crossOrigin) {
      link.crossOrigin = 'anonymous';
    }

    link.onload = () => {
      // Silent preload completion - reduce console noise
      // console.log(`Preloaded: ${url}`);
    };

    link.onerror = () => {
      // Only log actual errors, not successful preloads
      console.warn(`Failed to preload: ${url}`);
    };

    document.head.appendChild(link);
    preloadedResources.current.add(url);
  }, []);

  // Preload critical fonts (only when actually needed)
  useEffect(() => {
    if (!enableFontPreloading) return;

    // Check connection quality first
    const isSlowConnection = 'connection' in navigator && 
      (navigator.connection.effectiveType === '2g' || 
       navigator.connection.effectiveType === 'slow-2g' ||
       navigator.connection.downlink < 1.5);

    if (isSlowConnection) {
      console.log('Slow connection detected, reducing font preloading');
      return;
    }

    // Only preload fonts that are critical and used immediately on this page
    // Arabic font is only preloaded if we're on a page that needs it
    const currentPath = window.location.pathname;
    const needsArabicFont = currentPath.includes('/surah/') || 
                           currentPath.includes('/pages/') || 
                           currentPath.includes('/juz/');

    if (!needsArabicFont) {
      console.log('Arabic font not needed for current page, skipping preload');
      return;
    }

    const criticalFonts = [
      '/fonts/arabic-font.woff2'
    ];

    criticalFonts.forEach((font, index) => {
      setTimeout(() => {
        preloadResource(font, 'preload', 'font');
      }, 500 + (index * 200)); // Stagger font loading
    });
  }, [enableFontPreloading, preloadResource]);

  // Preload routes based on current location
  useEffect(() => {
    if (!enableRoutePreloading) return;

    const routePreloadMap = {
      '/': ['/search', '/bookmarks', '/juz', '/pages'], // From homepage, likely to visit search, bookmarks, juz, or pages
      '/search': ['/surah'], // From search, likely to visit a surah
      '/surah': ['/bookmarks', '/search'], // From surah, likely to bookmark or search more
      '/juz': ['/surah', '/pages'], // From juz, likely to visit a surah or compare with pages
      '/pages': ['/surah', '/juz'], // From pages, likely to visit a surah or compare with juz
      '/profile': ['/bookmarks'], // From profile, likely to visit bookmarks
      '/auth/login': ['/'], // After login, go to homepage
      '/auth/register': ['/auth/login'] // After register, might go to login
    };

    const currentPath = location.pathname;
    const routesToPreload = routePreloadMap[currentPath] || [];

    routesToPreload.forEach(route => {
      setTimeout(() => {
        // Preload route component
        switch (route) {
          case '/search':
            import('../pages/SearchPage').catch(() => {});
            break;
          case '/bookmarks':
            import('../pages/BookmarksPage').catch(() => {});
            break;
          case '/pages':
            import('../pages/PageListPage').catch(() => {});
            break;
          case '/surah':
            import('../pages/SurahPage').catch(() => {});
            break;
          case '/profile':
            import('../pages/ProfilePage').catch(() => {});
            break;
          case '/doa-bersama':
            import('../pages/PrayerPage').catch(() => {});
            break;
          case '/':
            import('../pages/HomePage').catch(() => {});
            break;
        }
      }, preloadDelay);
    });
  }, [location.pathname, enableRoutePreloading, preloadDelay]);

  // Preload API endpoints based on current route
  useEffect(() => {
    if (!enableApiPreloading) return;

    const apiPreloadMap = {
      '/': ['/api/surahs', '/api/prayer-times'],
      '/search': ['/api/surahs'],
      '/profile': ['/api/profile'],
      '/bookmarks': ['/api/user/bookmarks'],
      '/doa-bersama': ['/api/doa-bersama', '/api/kategori-doa']
    };

    const currentPath = location.pathname;
    const apisToPreload = apiPreloadMap[currentPath] || [];

    apisToPreload.forEach(apiUrl => {
      setTimeout(() => {
        preloadResource(apiUrl, 'prefetch');
      }, preloadDelay + 500);
    });
  }, [location.pathname, enableApiPreloading, preloadDelay, preloadResource]);

  // Hover-based preloading
  const handleLinkHover = useCallback((event) => {
    if (!enableHoverPreloading) return;

    const link = event.target.closest('a[href]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.includes('//')) return;

    const timeoutId = setTimeout(() => {
      // Preload the route component
      if (href.startsWith('/surah/')) {
        import('../pages/SurahPage').catch(() => {});
      } else if (href === '/search') {
        import('../pages/SearchPage').catch(() => {});
      } else if (href === '/bookmarks') {
        import('../pages/BookmarksPage').catch(() => {});
      } else if (href === '/profile') {
        import('../pages/ProfilePage').catch(() => {});
      }

      // Preload the URL
      preloadResource(href, 'prefetch');
    }, 150); // Short delay to avoid preloading accidental hovers

    hoverTimeouts.current.set(link, timeoutId);
  }, [enableHoverPreloading, preloadResource]);

  const handleLinkHoverEnd = useCallback((event) => {
    const link = event.target.closest('a[href]');
    if (!link) return;

    const timeoutId = hoverTimeouts.current.get(link);
    if (timeoutId) {
      clearTimeout(timeoutId);
      hoverTimeouts.current.delete(link);
    }
  }, []);

  // Set up hover listeners
  useEffect(() => {
    if (!enableHoverPreloading) return;

    document.addEventListener('mouseover', handleLinkHover, { passive: true });
    document.addEventListener('mouseout', handleLinkHoverEnd, { passive: true });

    return () => {
      document.removeEventListener('mouseover', handleLinkHover);
      document.removeEventListener('mouseout', handleLinkHoverEnd);
      
      // Clear any pending timeouts
      hoverTimeouts.current.forEach(timeoutId => clearTimeout(timeoutId));
      hoverTimeouts.current.clear();
    };
  }, [enableHoverPreloading, handleLinkHover, handleLinkHoverEnd]);

  // Intersection-based preloading for images and components
  const createIntersectionPreloader = useCallback((callback, options = {}) => {
    if (!enableIntersectionPreloading) return null;

    const defaultOptions = {
      threshold: 0.1,
      rootMargin: '100px'
    };

    return new IntersectionObserver(callback, { ...defaultOptions, ...options });
  }, [enableIntersectionPreloading]);

  // Preload images when they come into viewport
  useEffect(() => {
    const observer = createIntersectionPreloader((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const dataSrc = img.getAttribute('data-src');
          
          if (dataSrc) {
            preloadResource(dataSrc, 'preload', 'image');
          }
        }
      });
    });

    if (!observer) return;

    // Observe all images with data-src attribute
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => observer.observe(img));

    return () => observer.disconnect();
  }, [createIntersectionPreloader, preloadResource]);

  // Resource priority hints based on connection type
  useEffect(() => {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      const { effectiveType, downlink, rtt } = connection;

      // Adjust preloading strategy based on connection quality
      const isSlowConnection = effectiveType === 'slow-2g' || effectiveType === '2g' || downlink < 1.5;

      if (isSlowConnection) {
        // Reduce preloading on slow connections (silent mode)
        return;
      }

      // On fast connections, be more aggressive with preloading (silent mode)
      if (effectiveType === '4g' && downlink > 5) {
        // Additional preloading logic for fast connections
      }
    }
  }, []);

  return {
    preloadResource,
    createIntersectionPreloader,
    preloadedCount: preloadedResources.current.size
  };
};

/**
 * Component-level preloader
 * Use this to preload specific resources for a component
 */
export const useComponentPreloader = (resources = []) => {
  const { preloadResource } = useResourcePreloader();

  useEffect(() => {
    resources.forEach(({ url, type = 'prefetch', as = null, delay = 0 }) => {
      setTimeout(() => {
        preloadResource(url, type, as);
      }, delay);
    });
  }, [resources, preloadResource]);
};

export default useResourcePreloader;
