/**
 * Advanced Image Optimization for PageSpeed Insights
 * Handles WebP conversion, lazy loading, LCP optimization, and responsive images
 */

import { useState, useEffect, useRef, useCallback } from 'react';

// Image optimization configuration
export const IMAGE_CONFIG = {
  QUALITY: {
    WEBP: 85,
    JPEG: 80,
    PNG: 90
  },
  BREAKPOINTS: [320, 640, 768, 1024, 1280, 1920],
  LAZY_LOADING: {
    root: null,
    rootMargin: '50px 0px',
    threshold: 0.01
  },
  MAX_DIMENSIONS: {
    width: 1920,
    height: 1080
  }
};

// Check if WebP is supported
export const isWebPSupported = () => {
  if (typeof document === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
};

// Check if AVIF is supported
export const isAVIFSupported = () => {
  if (typeof document === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  
  try {
    return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
  } catch {
    return false;
  }
};

// Get optimal image format
export const getOptimalFormat = (originalFormat = 'jpeg') => {
  if (isAVIFSupported()) return 'avif';
  if (isWebPSupported()) return 'webp';
  return originalFormat;
};

/**
 * Hook for optimized image loading with WebP support and lazy loading
 */
export const useOptimizedImage = (src, options = {}) => {
    const [imageSrc, setImageSrc] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isError, setIsError] = useState(false);
    const imageRef = useRef(null);
    
    const {
        lazy = true,
        webpFallback = true,
        priority = false,
        sizes = '(max-width: 768px) 100vw, 50vw'
    } = options;

    // Generate WebP source if supported
    const getWebPSource = useCallback((originalSrc) => {
        if (!webpFallback || !originalSrc) return originalSrc;
        
        // Check if browser supports WebP
        const supportsWebP = (() => {
            const canvas = document.createElement('canvas');
            canvas.width = 1;
            canvas.height = 1;
            return canvas.toDataURL('image/webp').indexOf('webp') > -1;
        })();
        
        if (supportsWebP) {
            // Convert common extensions to WebP
            return originalSrc.replace(/\.(jpg|jpeg|png)$/i, '.webp');
        }
        
        return originalSrc;
    }, [webpFallback]);

    // Intersection Observer for lazy loading
    useEffect(() => {
        if (!lazy || priority) {
            setImageSrc(getWebPSource(src));
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setImageSrc(getWebPSource(src));
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                rootMargin: '50px' // Start loading 50px before image is visible
            }
        );

        if (imageRef.current) {
            observer.observe(imageRef.current);
        }

        return () => observer.disconnect();
    }, [src, lazy, priority, getWebPSource]);

    // Handle image load events
    const handleLoad = useCallback(() => {
        setIsLoaded(true);
        setIsError(false);
    }, []);

    const handleError = useCallback(() => {
        setIsError(true);
        // Fallback to original source if WebP fails
        if (webpFallback && imageSrc && imageSrc.includes('.webp')) {
            setImageSrc(src);
        }
    }, [src, imageSrc, webpFallback]);

    return {
        imageRef,
        imageSrc,
        isLoaded,
        isError,
        handleLoad,
        handleError,
        sizes
    };
};

/**
 * Optimized Image Component with built-in performance optimizations
 */
export const OptimizedImage = ({
    src,
    alt,
    className = '',
    lazy = true,
    priority = false,
    webpFallback = true,
    placeholder = null,
    sizes = '(max-width: 768px) 100vw, 50vw',
    ...props
}) => {
    const {
        imageRef,
        imageSrc,
        isLoaded,
        isError,
        handleLoad,
        handleError
    } = useOptimizedImage(src, { lazy, priority, webpFallback, sizes });

    // Generate placeholder for better CLS prevention
    const placeholderStyle = placeholder ? {
        backgroundImage: `url(${placeholder})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
    } : {};

    return (
        <div 
            ref={imageRef}
            className={`relative overflow-hidden ${className}`}
            style={placeholderStyle}
        >
            {imageSrc && (
                <img
                    src={imageSrc}
                    alt={alt}
                    loading={priority ? 'eager' : 'lazy'}
                    decoding="async"
                    sizes={sizes}
                    onLoad={handleLoad}
                    onError={handleError}
                    className={`
                        w-full h-full object-cover transition-opacity duration-300
                        ${isLoaded ? 'opacity-100' : 'opacity-0'}
                        ${isError ? 'hidden' : 'block'}
                    `}
                    {...props}
                />
            )}
            
            {/* Error fallback */}
            {isError && (
                <div className="flex items-center justify-center bg-gray-200 text-gray-500 text-sm">
                    <span>Image unavailable</span>
                </div>
            )}
            
            {/* Loading placeholder */}
            {!isLoaded && !isError && imageSrc && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
        </div>
    );
};

/**
 * Preload critical images for LCP optimization
 */
export const preloadCriticalImages = (images) => {
    images.forEach(({ src, priority = false }) => {
        const link = document.createElement('link');
        link.rel = priority ? 'preload' : 'prefetch';
        link.as = 'image';
        link.href = src;
        
        // Add error handling
        link.onerror = () => {
            console.warn(`Failed to preload image: ${src}`);
        };
        
        document.head.appendChild(link);
    });
};

/**
 * Generate responsive image sources for different screen sizes
 */
export const generateResponsiveSources = (baseSrc, breakpoints = [320, 640, 768, 1024, 1280]) => {
    return breakpoints.map(width => ({
        src: baseSrc.replace(/(\.[^.]+)$/, `_${width}w$1`),
        width: `${width}w`
    }));
};

/**
 * Initialize image optimizations with configuration
 * @param {Object} config - Configuration options
 */
export const initializeImageOptimizations = (config = {}) => {
    const {
        enableLazyLoading = true,
        enableResponsive = true,
        optimizeFormat = true
    } = config;

    // Store configuration globally
    if (typeof window !== 'undefined') {
        window.imageOptimizationConfig = {
            enableLazyLoading,
            enableResponsive,
            optimizeFormat
        };
    }

    // Initialize intersection observer for lazy loading if enabled
    if (enableLazyLoading && typeof window !== 'undefined' && 'IntersectionObserver' in window) {
        const lazyImageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.dataset.src;
                    if (src) {
                        img.src = src;
                        img.removeAttribute('data-src');
                        lazyImageObserver.unobserve(img);
                    }
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        // Observe all images with data-src attribute
        document.querySelectorAll('img[data-src]').forEach(img => {
            lazyImageObserver.observe(img);
        });
    }

    console.log('Image optimizations initialized', config);
};

export default {
    useOptimizedImage,
    OptimizedImage,
    preloadCriticalImages,
    generateResponsiveSources,
    initializeImageOptimizations
};
