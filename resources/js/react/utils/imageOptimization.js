/**
 * Optimized Image Loading Utility for Mobile Performance
 * Handles WebP conversion, lazy loading, and LCP optimization
 */

import { useState, useEffect, useRef, useCallback } from 'react';

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

export default {
    useOptimizedImage,
    OptimizedImage,
    preloadCriticalImages,
    generateResponsiveSources
};
