import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
    preloadRouteResources, 
    getNetworkAwarePreloadStrategy,
    isMemoryConstrained,
    PRELOAD_PRIORITIES 
} from '../utils/preloadUtils';

/**
 * Enhanced hook for intelligent resource preloading
 */
export const useIntelligentPreload = (options = {}) => {
    const location = useLocation();
    const preloadCache = useRef(new Set());
    const { enableRoutePreload = true, enableHoverPreloadOption = true } = options;
    
    // Network and memory awareness
    const networkStrategy = getNetworkAwarePreloadStrategy();
    const memoryConstrained = isMemoryConstrained();
    
    // Route-based preloading
    useEffect(() => {
        if (!enableRoutePreload || !networkStrategy.enablePreload || memoryConstrained) {
            return;
        }
        
        const currentRoute = location.pathname;
        
        // Avoid duplicate preloading
        if (preloadCache.current.has(currentRoute)) {
            return;
        }
        
        preloadCache.current.add(currentRoute);
        preloadRouteResources(currentRoute);
        
        // Clean up cache periodically
        if (preloadCache.current.size > 10) {
            preloadCache.current.clear();
        }
    }, [location.pathname, enableRoutePreload, networkStrategy.enablePreload, memoryConstrained]);
    
    // Hover-based preloading helper
    const enableHoverPreload = useCallback((element, moduleImporter) => {
        if (!enableHoverPreloadOption || !networkStrategy.enablePreload || memoryConstrained) {
            return () => {};
        }
        
        let preloadTimer;
        let hasPreloaded = false;
        
        const handleMouseEnter = () => {
            if (hasPreloaded) return;
            
            preloadTimer = setTimeout(async () => {
                try {
                    await moduleImporter();
                    hasPreloaded = true;
                } catch (error) {
                    console.warn('Hover preload failed:', error);
                }
            }, 100);
        };
        
        const handleMouseLeave = () => {
            if (preloadTimer) {
                clearTimeout(preloadTimer);
            }
        };
        
        element.addEventListener('mouseenter', handleMouseEnter);
        element.addEventListener('mouseleave', handleMouseLeave);
        
        return () => {
            element.removeEventListener('mouseenter', handleMouseEnter);
            element.removeEventListener('mouseleave', handleMouseLeave);
            if (preloadTimer) {
                clearTimeout(preloadTimer);
            }
        };
    }, [enableHoverPreloadOption, networkStrategy.enablePreload, memoryConstrained]);
    
    return {
        enableHoverPreload,
        networkStrategy,
        memoryConstrained,
        canPreload: networkStrategy.enablePreload && !memoryConstrained
    };
};

/**
 * Hook for managing critical resource loading
 */
export const useCriticalResources = () => {
    const loadedResources = useRef(new Set());
    
    const loadCriticalCSS = useCallback(async (stylesheets) => {
        const loadPromises = stylesheets
            .filter(href => !loadedResources.current.has(href))
            .map(async (href) => {
                try {
                    await new Promise((resolve, reject) => {
                        const link = document.createElement('link');
                        link.rel = 'stylesheet';
                        link.href = href;
                        link.onload = resolve;
                        link.onerror = reject;
                        document.head.appendChild(link);
                    });
                    loadedResources.current.add(href);
                } catch (error) {
                    console.warn(`Failed to load critical CSS: ${href}`, error);
                }
            });
        
        await Promise.allSettled(loadPromises);
    }, []);
    
    const preloadFonts = useCallback(async (fonts) => {
        const loadPromises = fonts
            .filter(font => !loadedResources.current.has(font.href))
            .map(async (font) => {
                try {
                    const link = document.createElement('link');
                    link.rel = 'preload';
                    link.as = 'font';
                    link.type = font.type || 'font/woff2';
                    link.href = font.href;
                    link.crossOrigin = 'anonymous';
                    document.head.appendChild(link);
                    loadedResources.current.add(font.href);
                } catch (error) {
                    console.warn(`Failed to preload font: ${font.href}`, error);
                }
            });
        
        await Promise.allSettled(loadPromises);
    }, []);
    
    return {
        loadCriticalCSS,
        preloadFonts
    };
};

/**
 * Hook for performance monitoring and optimization
 */
export const usePerformanceOptimization = () => {
    const metricsRef = useRef({});
    
    // Measure component render time
    const measureRender = useCallback((componentName, renderFn) => {
        const startTime = performance.now();
        const result = renderFn();
        const endTime = performance.now();
        
        metricsRef.current[componentName] = {
            renderTime: endTime - startTime,
            timestamp: Date.now()
        };
        
        // Log slow renders in development
        if (process.env.NODE_ENV === 'development' && (endTime - startTime) > 16) {
            console.warn(`Slow render detected for ${componentName}: ${(endTime - startTime).toFixed(2)}ms`);
        }
        
        return result;
    }, []);
    
    // Optimize images with loading strategies
    const optimizeImage = useCallback((src, options = {}) => {
        const { 
            loading = 'lazy', 
            decoding = 'async',
            sizes = '(max-width: 768px) 100vw, 50vw'
        } = options;
        
        return {
            src,
            loading,
            decoding,
            sizes
        };
    }, []);
    
    // Debounce expensive operations
    const useDebounce = useCallback((callback, delay) => {
        const timeoutRef = useRef();
        
        return useCallback((...args) => {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => callback(...args), delay);
        }, [callback, delay]);
    }, []);
    
    // Throttle for scroll/resize events
    const useThrottle = useCallback((callback, limit) => {
        const inThrottle = useRef(false);
        
        return useCallback((...args) => {
            if (!inThrottle.current) {
                callback(...args);
                inThrottle.current = true;
                setTimeout(() => inThrottle.current = false, limit);
            }
        }, [callback, limit]);
    }, []);
    
    return {
        measureRender,
        optimizeImage,
        useDebounce,
        useThrottle,
        getMetrics: () => metricsRef.current
    };
};

export default {
    useIntelligentPreload,
    useCriticalResources,
    usePerformanceOptimization
};
