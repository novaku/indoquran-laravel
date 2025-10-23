/**
 * Resource Preloading and Prefetching for PageSpeed Optimization
 * Implements intelligent resource loading based on user behavior and network conditions
 */

/**
 * Resource preloading configuration
 */
export const PRELOAD_CONFIG = {
  // Critical resources that should be preloaded immediately
  // Note: Vite handles CSS and JS preloading automatically via @vite directive
  // No need to hardcode paths as they change with each build
  CRITICAL_RESOURCES: [
    { href: '/android-chrome-192x192.png', as: 'image', type: 'image/png' }
  ],
  
  // DNS prefetch domains
  DNS_PREFETCH: [
    '//fonts.googleapis.com',
    '//fonts.gstatic.com',
    '//www.google-analytics.com',
    '//api.indoquran.web.id'
  ],
  
  // Preconnect domains for critical third-party resources
  PRECONNECT: [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ],
  
  // Route-based prefetching priorities
  ROUTE_PRIORITIES: {
    high: ['/surah', '/surah/1', '/cari'],
    medium: ['/juz', '/halaman', '/asmaul-husna'],
    low: ['/tentang', '/kontak', '/donasi']
  }
};

/**
 * Network condition detection
 */
export const getNetworkCondition = () => {
  if (!navigator.connection) {
    return { effectiveType: '4g', saveData: false, downlink: 10 };
  }
  
  return {
    effectiveType: navigator.connection.effectiveType,
    saveData: navigator.connection.saveData,
    downlink: navigator.connection.downlink,
    rtt: navigator.connection.rtt
  };
};

/**
 * Check if we should preload based on network conditions
 */
export const shouldPreload = () => {
  const network = getNetworkCondition();
  
  // Don't preload on slow connections or when user has data saver enabled
  if (network.saveData) return false;
  if (['slow-2g', '2g'].includes(network.effectiveType)) return false;
  
  return true;
};

/**
 * Check if device has sufficient memory for preloading
 */
export const hasMemoryForPreloading = () => {
  if (!navigator.deviceMemory) return true; // Assume yes if unknown
  
  // Only preload on devices with more than 2GB RAM
  return navigator.deviceMemory > 2;
};

/**
 * Preload critical resources
 */
export const preloadCriticalResources = () => {
  if (!shouldPreload() || !hasMemoryForPreloading()) return;
  
  PRELOAD_CONFIG.CRITICAL_RESOURCES.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource.href;
    link.as = resource.as;
    
    if (resource.type) {
      link.type = resource.type;
    }
    
    // Add crossorigin for fonts
    if (resource.as === 'font') {
      link.crossOrigin = 'anonymous';
    }
    
    document.head.appendChild(link);
  });
};

/**
 * Setup DNS prefetch for external domains
 */
export const setupDNSPrefetch = () => {
  PRELOAD_CONFIG.DNS_PREFETCH.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = domain;
    document.head.appendChild(link);
  });
};

/**
 * Setup preconnect for critical third-party resources
 */
export const setupPreconnect = () => {
  PRELOAD_CONFIG.PRECONNECT.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

/**
 * Intelligent route prefetching based on user behavior
 */
class RoutePreloader {
  constructor() {
    this.prefetchedRoutes = new Set();
    this.hoverTimer = null;
    this.priority = 'medium';
    this.isEnabled = shouldPreload() && hasMemoryForPreloading();
  }
  
  /**
   * Prefetch route resources
   */
  async prefetchRoute(path) {
    if (!this.isEnabled || this.prefetchedRoutes.has(path)) return;
    
    try {
      // Mark as prefetched to avoid duplicates
      this.prefetchedRoutes.add(path);
      
      // Determine chunk name based on route
      const chunkName = this.getChunkNameForRoute(path);
      if (!chunkName) return;
      
      // Dynamically import the route component
      switch (chunkName) {
        case 'surah-list':
          await import(/* webpackChunkName: "surah-list" */ '../pages/SurahListPage');
          break;
        case 'surah':
          await import(/* webpackChunkName: "surah" */ '../pages/SurahDetailPage');
          break;
        case 'search':
          await import(/* webpackChunkName: "search" */ '../pages/QuranSearchPage');
          break;
        case 'juz-pages':
          await import(/* webpackChunkName: "juz-pages" */ '../pages/JuzIndexPage');
          break;
        case 'content-pages':
          await import(/* webpackChunkName: "content-pages" */ '../pages/AboutProjectPage');
          break;
        default:
          console.log(`No prefetch available for route: ${path}`);
      }
    } catch (error) {
      console.warn('Route prefetch failed:', path, error);
      this.prefetchedRoutes.delete(path);
    }
  }
  
  /**
   * Get chunk name for route
   */
  getChunkNameForRoute(path) {
    if (path.startsWith('/surah/')) return 'surah';
    if (path === '/surah') return 'surah-list';
    if (path === '/cari') return 'search';
    if (path.startsWith('/juz')) return 'juz-pages';
    if (['/tentang', '/kontak', '/donasi'].includes(path)) return 'content-pages';
    
    return null;
  }
  
  /**
   * Setup hover-based prefetching
   */
  setupHoverPrefetch() {
    if (!this.isEnabled) return;
    
    document.addEventListener('mouseover', (event) => {
      const link = event.target.closest('a[href^="/"]');
      if (!link) return;
      
      const href = link.getAttribute('href');
      if (!href || this.prefetchedRoutes.has(href)) return;
      
      // Debounce hover events
      clearTimeout(this.hoverTimer);
      this.hoverTimer = setTimeout(() => {
        this.prefetchRoute(href);
      }, 100);
    });
    
    document.addEventListener('mouseout', () => {
      clearTimeout(this.hoverTimer);
    });
  }
  
  /**
   * Prefetch high-priority routes
   */
  prefetchHighPriorityRoutes() {
    if (!this.isEnabled) return;
    
    // Use requestIdleCallback to avoid blocking main thread
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        PRELOAD_CONFIG.ROUTE_PRIORITIES.high.forEach(route => {
          this.prefetchRoute(route);
        });
      }, { timeout: 5000 });
    } else {
      setTimeout(() => {
        PRELOAD_CONFIG.ROUTE_PRIORITIES.high.forEach(route => {
          this.prefetchRoute(route);
        });
      }, 3000);
    }
  }
  
  /**
   * Setup intersection observer for visible links
   */
  setupVisibilityPrefetch() {
    if (!this.isEnabled || !('IntersectionObserver' in window)) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const link = entry.target;
          const href = link.getAttribute('href');
          
          if (href && href.startsWith('/')) {
            this.prefetchRoute(href);
          }
          
          observer.unobserve(link);
        }
      });
    }, {
      rootMargin: '100px'
    });
    
    // Observe all internal links
    document.querySelectorAll('a[href^="/"]').forEach(link => {
      observer.observe(link);
    });
    
    // Handle dynamic links
    const linkObserver = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            const links = node.tagName === 'A' ? [node] : node.querySelectorAll('a[href^="/"]');
            links.forEach(link => observer.observe(link));
          }
        });
      });
    });
    
    linkObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  /**
   * Initialize all prefetching strategies
   */
  initialize() {
    if (!this.isEnabled) {
      console.log('Route prefetching disabled due to network/memory constraints');
      return;
    }
    
    // Setup different prefetching strategies
    this.setupHoverPrefetch();
    this.setupVisibilityPrefetch();
    
    // Prefetch high-priority routes after initial load
    if (document.readyState === 'complete') {
      this.prefetchHighPriorityRoutes();
    } else {
      window.addEventListener('load', () => {
        this.prefetchHighPriorityRoutes();
      });
    }
  }
}

// Global route preloader instance
let globalRoutePreloader = null;

/**
 * Initialize route preloading
 */
export const initializeRoutePreloading = () => {
  if (globalRoutePreloader) return globalRoutePreloader;
  
  globalRoutePreloader = new RoutePreloader();
  globalRoutePreloader.initialize();
  
  return globalRoutePreloader;
};

/**
 * Font preloading optimization
 */
export const preloadFonts = () => {
  const fonts = [
    { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap', type: 'text/css' },
    { href: '/fonts/AlQuran-IndoPak-by-QuranWBW.v.4.2.2-WL-COMPRESSED.ttf', type: 'font/ttf' }
  ];
  
  fonts.forEach(font => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = font.href;
    link.as = font.type === 'text/css' ? 'style' : 'font';
    
    if (font.type === 'font/woff2') {
      link.type = font.type;
      link.crossOrigin = 'anonymous';
    }
    
    document.head.appendChild(link);
  });
};

/**
 * Service Worker prefetching
 */
export const setupServiceWorkerPrefetch = () => {
  if (!('serviceWorker' in navigator)) return;
  
  navigator.serviceWorker.ready.then(registration => {
    // Send prefetch list to service worker
    registration.active?.postMessage({
      type: 'PREFETCH_ROUTES',
      routes: [
        ...PRELOAD_CONFIG.ROUTE_PRIORITIES.high,
        ...PRELOAD_CONFIG.ROUTE_PRIORITIES.medium
      ]
    });
  });
};

/**
 * Initialize all resource preloading optimizations
 */
export const initializeResourcePreloading = () => {
  // Setup basic resource hints
  setupDNSPrefetch();
  setupPreconnect();
  
  // Preload critical resources
  preloadCriticalResources();
  
  // Preload fonts
  preloadFonts();
  
  // Initialize route prefetching
  initializeRoutePreloading();
  
  // Setup service worker prefetching
  setupServiceWorkerPrefetch();
  
  console.log('Resource preloading initialized');
};

/**
 * Manual prefetch function for components
 */
export const prefetchResource = async (url, as = 'fetch') => {
  if (!shouldPreload()) return;
  
  try {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    link.as = as;
    
    document.head.appendChild(link);
    
    // Also prefetch via fetch for immediate use
    if (as === 'fetch') {
      await fetch(url, { mode: 'cors' });
    }
  } catch (error) {
    console.warn('Resource prefetch failed:', url, error);
  }
};

export default {
  PRELOAD_CONFIG,
  getNetworkCondition,
  shouldPreload,
  hasMemoryForPreloading,
  preloadCriticalResources,
  setupDNSPrefetch,
  setupPreconnect,
  RoutePreloader,
  initializeRoutePreloading,
  preloadFonts,
  setupServiceWorkerPrefetch,
  initializeResourcePreloading,
  prefetchResource
};
