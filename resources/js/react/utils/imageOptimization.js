/**
 * Image Optimization Utilities
 * Provides functions for optimizing images for better performance
 */

// Detect WebP support
const isWebPSupported = (() => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
})();

// Detect AVIF support
const isAVIFSupported = (() => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  // AVIF support is limited, so we'll use a more comprehensive check
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  });
})();

/**
 * Get the best image format based on browser support
 */
export const getBestImageFormat = () => {
  if (isWebPSupported) return 'webp';
  return 'jpg';
};

/**
 * Generate responsive image URL with automatic format detection
 */
export const getOptimizedImageUrl = (baseUrl, options = {}) => {
  const {
    width = null,
    height = null,
    quality = 85,
    format = 'auto',
    enableWebP = true,
    enableAVIF = false
  } = options;

  if (!baseUrl) return '';

  // If it's an external URL, return as-is
  if (baseUrl.startsWith('http://') || baseUrl.startsWith('https://')) {
    return baseUrl;
  }

  // Build query parameters
  const params = new URLSearchParams();

  if (width) params.append('w', width);
  if (height) params.append('h', height);
  if (quality !== 85) params.append('q', quality);

  // Auto format detection
  if (format === 'auto') {
    if (enableAVIF && isAVIFSupported) {
      params.append('f', 'avif');
    } else if (enableWebP && isWebPSupported) {
      params.append('f', 'webp');
    }
  } else if (format !== 'original') {
    params.append('f', format);
  }

  const queryString = params.toString();
  const separator = baseUrl.includes('?') ? '&' : '?';

  return queryString ? `${baseUrl}${separator}${queryString}` : baseUrl;
};

/**
 * Generate srcset for responsive images
 */
export const generateSrcSet = (baseUrl, widths = [400, 800, 1200, 1600], options = {}) => {
  return widths
    .map(width => {
      const url = getOptimizedImageUrl(baseUrl, { ...options, width });
      return `${url} ${width}w`;
    })
    .join(', ');
};

/**
 * Generate responsive image props
 */
export const getResponsiveImageProps = (src, options = {}) => {
  const {
    alt = '',
    sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    widths = [400, 800, 1200, 1600],
    aspectRatio = null,
    priority = false,
    ...imageOptions
  } = options;

  const props = {
    src: getOptimizedImageUrl(src, imageOptions),
    alt,
    loading: priority ? 'eager' : 'lazy',
    decoding: priority ? 'sync' : 'async'
  };

  // Add srcset for responsive images
  if (widths.length > 1) {
    props.srcSet = generateSrcSet(src, widths, imageOptions);
    props.sizes = sizes;
  }

  // Add aspect ratio for layout stability
  if (aspectRatio) {
    props.style = {
      ...(props.style || {}),
      aspectRatio: aspectRatio
    };
  }

  return props;
};

/**
 * Blur data URL generator for loading placeholders
 */
export const generateBlurDataURL = (width = 10, height = 10, color = '#f3f4f6') => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL('image/jpeg', 0.1);
};

/**
 * Image compression utility
 */
export const compressImage = (file, options = {}) => {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.8,
    format = 'image/jpeg'
  } = options;

  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(resolve, format, quality);
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * Preload critical images
 */
export const preloadImage = (src, options = {}) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => resolve(img);
    img.onerror = reject;
    
    // Set attributes for optimization
    if (options.crossOrigin) {
      img.crossOrigin = options.crossOrigin;
    }
    
    img.src = getOptimizedImageUrl(src, options);
  });
};

/**
 * Batch preload multiple images
 */
export const preloadImages = (sources, options = {}) => {
  const promises = sources.map(src => preloadImage(src, options));
  return Promise.allSettled(promises);
};

/**
 * Image lazy loading observer
 */
export const createImageLazyLoader = (options = {}) => {
  const {
    rootMargin = '50px',
    threshold = 0.1,
    enableFadeIn = true
  } = options;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.dataset.src;
          
          if (src) {
            // Create optimized URL
            const optimizedSrc = getOptimizedImageUrl(src);
            
            // Load the image
            const tempImg = new Image();
            tempImg.onload = () => {
              img.src = optimizedSrc;
              img.removeAttribute('data-src');
              
              // Add fade-in effect
              if (enableFadeIn) {
                img.style.opacity = '0';
                img.style.transition = 'opacity 0.3s ease-in-out';
                
                requestAnimationFrame(() => {
                  img.style.opacity = '1';
                });
              }
              
              observer.unobserve(img);
            };
            
            tempImg.src = optimizedSrc;
          }
        }
      });
    },
    {
      rootMargin,
      threshold
    }
  );

  return observer;
};

/**
 * Detect image loading state
 */
export const getImageLoadingState = (img) => {
  if (!img.complete) return 'loading';
  if (img.naturalWidth === 0) return 'error';
  return 'loaded';
};

/**
 * Calculate image aspect ratio
 */
export const calculateAspectRatio = (width, height) => {
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  return `${width / divisor}/${height / divisor}`;
};

/**
 * Image performance analytics
 */
export const trackImagePerformance = (imageSrc, startTime = performance.now()) => {
  const img = new Image();
  
  img.onload = () => {
    const loadTime = performance.now() - startTime;
    const fileSize = img.src.length; // Approximate
    
    // Log performance metrics
    console.log(`Image loaded: ${imageSrc}`, {
      loadTime: `${Math.round(loadTime)}ms`,
      dimensions: `${img.naturalWidth}x${img.naturalHeight}`,
      estimatedSize: `${Math.round(fileSize / 1024)}KB`
    });
    
    // Send to analytics if available
    if (typeof gtag !== 'undefined') {
      gtag('event', 'image_performance', {
        image_src: imageSrc,
        load_time: Math.round(loadTime),
        file_size: Math.round(fileSize / 1024)
      });
    }
  };
  
  img.src = imageSrc;
};

export default {
  getBestImageFormat,
  getOptimizedImageUrl,
  generateSrcSet,
  getResponsiveImageProps,
  generateBlurDataURL,
  compressImage,
  preloadImage,
  preloadImages,
  createImageLazyLoader,
  getImageLoadingState,
  calculateAspectRatio,
  trackImagePerformance
};
