/**
 * Utility functions for preloading critical resources and optimizing performance
 */

// Resource priorities for intelligent preloading
export const PRELOAD_PRIORITIES = {
    HIGH: 'high',
    MEDIUM: 'medium', 
    LOW: 'low'
};

// Route-based preloading map
const ROUTE_PRELOAD_MAP = {
    '/': {
        next: ['/surah', '/cari'],
        priority: PRELOAD_PRIORITIES.HIGH
    },
    '/surah': {
        next: ['/surah/1', '/cari'],
        priority: PRELOAD_PRIORITIES.HIGH
    },
    '/cari': {
        next: ['/surah'],
        priority: PRELOAD_PRIORITIES.MEDIUM
    }
};

/**
 * Preload a module with error handling
 */
export const preloadModule = async (moduleImporter, options = {}) => {
    try {
        const { priority = PRELOAD_PRIORITIES.MEDIUM, timeout = 5000 } = options;
        
        // Use requestIdleCallback for low priority preloads
        if (priority === PRELOAD_PRIORITIES.LOW && 'requestIdleCallback' in window) {
            return new Promise((resolve, reject) => {
                requestIdleCallback(async () => {
                    try {
                        const module = await moduleImporter();
                        resolve(module);
                    } catch (error) {
                        reject(error);
                    }
                }, { timeout });
            });
        }
        
        return await moduleImporter();
    } catch (error) {
        console.warn('Failed to preload module:', error);
        return null;
    }
};

/**
 * Preload critical CSS files
 */
export const preloadCSS = (href, options = {}) => {
    return new Promise((resolve, reject) => {
        // Check if already loaded
        if (document.querySelector(`link[href="${href}"]`)) {
            resolve();
            return;
        }

        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'style';
        link.href = href;
        link.crossOrigin = 'anonymous';
        
        if (options.media) {
            link.media = options.media;
        }

        link.onload = () => {
            // Convert to actual stylesheet
            link.rel = 'stylesheet';
            resolve();
        };
        
        link.onerror = reject;
        
        document.head.appendChild(link);
    });
};

/**
 * Preload fonts with proper display strategy
 */
export const preloadFont = (href, options = {}) => {
    return new Promise((resolve) => {
        // Check if already loaded
        if (document.querySelector(`link[href="${href}"]`)) {
            resolve();
            return;
        }

        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'font';
        link.type = options.type || 'font/woff2';
        link.href = href;
        link.crossOrigin = 'anonymous';
        
        link.onload = resolve;
        link.onerror = resolve; // Don't fail if font loading fails
        
        document.head.appendChild(link);
    });
};

/**
 * Intelligent route-based preloading
 */
export const preloadRouteResources = (currentRoute) => {
    const routeConfig = ROUTE_PRELOAD_MAP[currentRoute];
    
    if (!routeConfig) return;
    
    const { next: nextRoutes, priority } = routeConfig;
    
    // Preload likely next pages based on current route
    nextRoutes.forEach(route => {
        const modulePromise = getModuleForRoute(route);
        if (modulePromise) {
            preloadModule(modulePromise, { priority });
        }
    });
};

/**
 * Get module importer for route
 */
const getModuleForRoute = (route) => {
    const routeModuleMap = {
        '/surah': () => import(/* webpackChunkName: "surah-list" */ '../pages/SurahListPage'),
        '/surah/1': () => import(/* webpackChunkName: "surah" */ '../pages/SurahDetailPage'),
        '/cari': () => import(/* webpackChunkName: "search" */ '../pages/QuranSearchPage'),
        '/juz': () => import(/* webpackChunkName: "juz-pages" */ '../pages/JuzIndexPage'),
        '/tentang': () => import(/* webpackChunkName: "content-pages" */ '../pages/AboutProjectPage'),
        '/kontak': () => import(/* webpackChunkName: "content-pages" */ '../pages/ContactSupportPage'),
    };
    
    return routeModuleMap[route];
};

/**
 * Preload based on user interaction hints
 */
export const preloadOnHover = (element, moduleImporter) => {
    let preloadTimer;
    let hasPreloaded = false;
    
    const handleMouseEnter = () => {
        if (hasPreloaded) return;
        
        // Delay preload slightly to avoid excessive preloading on quick hovers
        preloadTimer = setTimeout(async () => {
            await preloadModule(moduleImporter, { priority: PRELOAD_PRIORITIES.MEDIUM });
            hasPreloaded = true;
        }, 100);
    };
    
    const handleMouseLeave = () => {
        if (preloadTimer) {
            clearTimeout(preloadTimer);
        }
    };
    
    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);
    
    // Return cleanup function
    return () => {
        element.removeEventListener('mouseenter', handleMouseEnter);
        element.removeEventListener('mouseleave', handleMouseLeave);
        if (preloadTimer) {
            clearTimeout(preloadTimer);
        }
    };
};

/**
 * Intersection Observer-based preloading for visible elements
 */
export const preloadOnVisible = (element, moduleImporter, options = {}) => {
    const { threshold = 0.1, rootMargin = '50px' } = options;
    
    if (!('IntersectionObserver' in window)) {
        // Fallback for browsers without IntersectionObserver
        setTimeout(() => preloadModule(moduleImporter), 1000);
        return () => {};
    }
    
    let hasPreloaded = false;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !hasPreloaded) {
                preloadModule(moduleImporter, { priority: PRELOAD_PRIORITIES.LOW });
                hasPreloaded = true;
                observer.unobserve(element);
            }
        });
    }, { threshold, rootMargin });
    
    observer.observe(element);
    
    return () => observer.disconnect();
};

/**
 * Network-aware preloading
 */
export const getNetworkAwarePreloadStrategy = () => {
    // Check connection type if available
    if ('connection' in navigator) {
        const connection = navigator.connection;
        
        // Reduce preloading on slow connections
        if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
            return {
                enablePreload: false,
                priority: PRELOAD_PRIORITIES.LOW
            };
        }
        
        // Aggressive preloading on fast connections
        if (connection.effectiveType === '4g') {
            return {
                enablePreload: true,
                priority: PRELOAD_PRIORITIES.HIGH
            };
        }
    }
    
    // Default strategy
    return {
        enablePreload: true,
        priority: PRELOAD_PRIORITIES.MEDIUM
    };
};

/**
 * Memory-aware resource management
 */
export const isMemoryConstrained = () => {
    if ('memory' in performance) {
        // Consider devices with less than 4GB RAM as memory-constrained
        return performance.memory.jsHeapSizeLimit < 4 * 1024 * 1024 * 1024;
    }
    
    // Conservative fallback
    return false;
};

export default {
    preloadModule,
    preloadCSS,
    preloadFont,
    preloadRouteResources,
    preloadOnHover,
    preloadOnVisible,
    getNetworkAwarePreloadStrategy,
    isMemoryConstrained,
    PRELOAD_PRIORITIES
};
