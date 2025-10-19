import { useState, useEffect, useRef } from 'react';

/**
 * Optimized Image Component with lazy loading, WebP support, and blur placeholder
 * 
 * @param {Object} props
 * @param {string} props.src - Image source URL
 * @param {string} props.alt - Alt text for accessibility
 * @param {string} props.className - CSS classes
 * @param {boolean} props.eager - Load image immediately (default: false)
 * @param {string} props.sizes - Responsive sizes attribute
 * @param {number} props.width - Image width
 * @param {number} props.height - Image height
 * @param {string} props.objectFit - Object fit property (cover, contain, etc.)
 * @param {function} props.onLoad - Callback when image loads
 * @param {function} props.onError - Callback on error
 */
const OptimizedImage = ({
  src,
  alt = '',
  className = '',
  eager = false,
  sizes = '100vw',
  width,
  height,
  objectFit = 'cover',
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(eager);
  const [imageSrc, setImageSrc] = useState(null);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (eager || !imgRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observerRef.current?.disconnect();
          }
        });
      },
      {
        rootMargin: '50px', // Start loading 50px before entering viewport
        threshold: 0.01,
      }
    );

    observerRef.current.observe(imgRef.current);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [eager]);

  // Set image source when in view
  useEffect(() => {
    if (isInView && src) {
      setImageSrc(src);
    }
  }, [isInView, src]);

  // Generate WebP source if applicable
  const getWebPSource = (originalSrc) => {
    if (!originalSrc) return null;
    
    // Only convert if it's a JPEG or PNG
    if (originalSrc.match(/\.(jpe?g|png)$/i)) {
      return originalSrc.replace(/\.(jpe?g|png)$/i, '.webp');
    }
    
    return null;
  };

  const handleLoad = (e) => {
    setIsLoaded(true);
    setHasError(false);
    onLoad?.(e);
  };

  const handleError = (e) => {
    setHasError(true);
    onError?.(e);
  };

  const webpSrc = getWebPSource(imageSrc);

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{
        width: width || '100%',
        height: height || 'auto',
        backgroundColor: '#f3f4f6',
      }}
      {...props}
    >
      {imageSrc && !hasError ? (
        <picture>
          {/* WebP source for modern browsers */}
          {webpSrc && (
            <source type="image/webp" srcSet={webpSrc} sizes={sizes} />
          )}
          
          {/* Fallback to original format */}
          <img
            src={imageSrc}
            alt={alt}
            loading={eager ? 'eager' : 'lazy'}
            decoding="async"
            width={width}
            height={height}
            onLoad={handleLoad}
            onError={handleError}
            className={`
              w-full h-full transition-opacity duration-300
              ${isLoaded ? 'opacity-100' : 'opacity-0'}
            `}
            style={{
              objectFit,
            }}
          />
        </picture>
      ) : hasError ? (
        <div className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-400">
          <svg
            className="w-12 h-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      ) : null}

      {/* Loading placeholder */}
      {!isLoaded && !hasError && imageSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 animate-pulse">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
