import React, { useState, useRef, useEffect, memo } from 'react';

/**
 * High-performance image component optimized for mobile PageSpeed
 * Features: lazy loading, WebP support, responsive sizing, intersection observer
 */
const OptimizedImage = memo(({
    src,
    alt,
    className = '',
    width,
    height,
    priority = false,
    quality = 85,
    sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    onLoad,
    onError,
    ...props
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(priority);
    const [hasError, setHasError] = useState(false);
    const imgRef = useRef(null);
    const observerRef = useRef(null);

    // Generate responsive image sources with WebP support
    const generateSources = (baseSrc) => {
        if (!baseSrc) return { webp: '', fallback: baseSrc };
        
        const extension = baseSrc.split('.').pop()?.toLowerCase();
        const basePath = baseSrc.replace(/\.[^/.]+$/, '');
        
        // Check if WebP version exists (assume it exists for optimization)
        const webpSrc = `${basePath}.webp`;
        
        return {
            webp: webpSrc,
            fallback: baseSrc
        };
    };

    const { webp, fallback } = generateSources(src);

    // Intersection Observer for lazy loading
    useEffect(() => {
        if (priority) return;

        const currentRef = imgRef.current;
        if (!currentRef) return;

        observerRef.current = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observerRef.current?.disconnect();
                }
            },
            {
                rootMargin: '50px 0px', // Start loading 50px before coming into view
                threshold: 0.1
            }
        );

        observerRef.current.observe(currentRef);

        return () => {
            observerRef.current?.disconnect();
        };
    }, [priority]);

    // Handle image load events
    const handleLoad = (e) => {
        setIsLoaded(true);
        onLoad?.(e);
    };

    const handleError = (e) => {
        setHasError(true);
        onError?.(e);
    };

    // Don't render if not in view and not priority
    if (!isInView && !priority) {
        return (
            <div
                ref={imgRef}
                className={`bg-gray-200 animate-pulse ${className}`}
                style={{ 
                    width: width || '100%', 
                    height: height || 'auto',
                    aspectRatio: width && height ? `${width}/${height}` : undefined
                }}
                aria-label={`Loading ${alt}`}
            />
        );
    }

    return (
        <picture className={className}>
            {/* WebP source for modern browsers */}
            <source
                srcSet={webp}
                type="image/webp"
                sizes={sizes}
            />
            
            {/* Fallback image */}
            <img
                ref={imgRef}
                src={isInView ? fallback : undefined}
                alt={alt}
                width={width}
                height={height}
                loading={priority ? 'eager' : 'lazy'}
                decoding={priority ? 'sync' : 'async'}
                onLoad={handleLoad}
                onError={handleError}
                className={`
                    transition-opacity duration-300
                    ${isLoaded ? 'opacity-100' : 'opacity-0'}
                    ${hasError ? 'hidden' : ''}
                    ${className}
                `}
                style={{
                    maxWidth: '100%',
                    height: 'auto',
                    ...props.style
                }}
                {...props}
            />
            
            {/* Error fallback */}
            {hasError && (
                <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
                    <span className="text-gray-400 text-sm">Image unavailable</span>
                </div>
            )}
        </picture>
    );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;
