/**
 * Mobile Performance Configuration for IndoQuran
 * Optimizes Core Web Vitals for mobile devices
 */

// Mobile-specific performance thresholds
export const MOBILE_PERFORMANCE_CONFIG = {
  // Core Web Vitals thresholds (more lenient for mobile)
  LCP_THRESHOLD: 3000, // 3 seconds for mobile
  FID_THRESHOLD: 150,  // 150ms for mobile
  CLS_THRESHOLD: 0.15, // 0.15 for mobile

  // Resource loading limits
  MAX_CONCURRENT_REQUESTS: 4, // Limit concurrent requests on mobile
  MAX_IMAGE_SIZE: 1024 * 1024, // 1MB max for mobile images
  MAX_BUNDLE_SIZE: 250 * 1024, // 250KB max initial bundle
  
  // Cache settings
  CACHE_STORAGE_LIMIT: 50 * 1024 * 1024, // 50MB cache limit
  PREFETCH_DELAY: 3000, // Delay prefetching on mobile
  
  // Network conditions
  SLOW_NETWORK_TYPES: ['slow-2g', '2g', 'slow-3g'],
  SAVE_DATA_PREFERENCE: true,
  
  // Performance monitoring
  PERFORMANCE_SAMPLING_RATE: 0.1, // 10% sampling for mobile
  DEBUG_MODE: false
};

// Network-aware performance settings
export const getNetworkAwareConfig = () => {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  if (!connection) {
    return MOBILE_PERFORMANCE_CONFIG;
  }
  
  const isSlowConnection = MOBILE_PERFORMANCE_CONFIG.SLOW_NETWORK_TYPES.includes(connection.effectiveType);
  const hasSaveData = connection.saveData;
  
  if (isSlowConnection || hasSaveData) {
    return {
      ...MOBILE_PERFORMANCE_CONFIG,
      MAX_CONCURRENT_REQUESTS: 2,
      MAX_IMAGE_SIZE: 512 * 1024, // 512KB for slow connections
      MAX_BUNDLE_SIZE: 150 * 1024, // 150KB for slow connections
      PREFETCH_DELAY: 5000,
      DISABLE_PRELOAD: true,
      PERFORMANCE_SAMPLING_RATE: 0.05 // 5% sampling
    };
  }
  
  return MOBILE_PERFORMANCE_CONFIG;
};

// Device-specific optimizations
export const getDeviceOptimizations = () => {
  const deviceMemory = navigator.deviceMemory || 4; // Default to 4GB
  const hardwareConcurrency = navigator.hardwareConcurrency || 4;
  
  const isLowEndDevice = deviceMemory <= 2 || hardwareConcurrency <= 2;
  
  if (isLowEndDevice) {
    return {
      REDUCE_ANIMATIONS: true,
      LIMIT_CONCURRENT_RENDERS: 2,
      AGGRESSIVE_GC: true,
      DISABLE_COMPLEX_EFFECTS: true,
      SMALLER_IMAGES: true
    };
  }
  
  return {
    REDUCE_ANIMATIONS: false,
    LIMIT_CONCURRENT_RENDERS: 4,
    AGGRESSIVE_GC: false,
    DISABLE_COMPLEX_EFFECTS: false,
    SMALLER_IMAGES: false
  };
};

// Performance budget enforcement
export const PERFORMANCE_BUDGETS = {
  // Page load budgets
  FIRST_PAINT: 1000,        // 1 second
  FIRST_CONTENTFUL_PAINT: 1500, // 1.5 seconds
  LARGEST_CONTENTFUL_PAINT: 3000, // 3 seconds
  TIME_TO_INTERACTIVE: 4000, // 4 seconds
  
  // Resource budgets
  CRITICAL_CSS_SIZE: 14 * 1024,    // 14KB critical CSS
  CRITICAL_JS_SIZE: 100 * 1024,    // 100KB critical JS
  TOTAL_PAGE_SIZE: 1024 * 1024,    // 1MB total page size
  IMAGE_BUDGET: 500 * 1024,        // 500KB images per page
  
  // Network budgets
  DNS_LOOKUP_TIME: 200,      // 200ms DNS lookup
  TCP_CONNECTION_TIME: 300,  // 300ms TCP connection
  SSL_NEGOTIATION_TIME: 500, // 500ms SSL handshake
  TTFB: 800,                 // 800ms Time to First Byte
  
  // User interaction budgets
  INPUT_DELAY: 100,          // 100ms input delay
  SCROLL_RESPONSE: 16,       // 16ms scroll response (60fps)
  ANIMATION_FRAME: 16        // 16ms animation frame
};

// Performance monitoring configuration
export const MONITORING_CONFIG = {
  // Core Web Vitals
  TRACK_LCP: true,
  TRACK_FID: true,
  TRACK_CLS: true,
  TRACK_TTFB: true,
  TRACK_FCP: true,
  
  // Custom metrics
  TRACK_BUNDLE_SIZE: true,
  TRACK_CACHE_HITS: true,
  TRACK_NETWORK_FAILURES: true,
  TRACK_MEMORY_USAGE: true,
  
  // Reporting
  SEND_TO_ANALYTICS: false, // Disable by default for privacy
  LOG_TO_CONSOLE: false,    // Disable in production
  ALERT_ON_THRESHOLD: false // Disable alerts in production
};

// Critical resource hints for mobile
export const CRITICAL_RESOURCE_HINTS = [
  // DNS prefetch (highest priority)
  { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
  { rel: 'dns-prefetch', href: '//fonts.gstatic.com' },
  
  // Preconnect (high priority)
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true },
  
  // Preload critical resources only
  { rel: 'preload', href: '/fonts/inter-latin-400.woff2', as: 'font', type: 'font/woff2', crossorigin: true },
  { rel: 'preload', href: '/fonts/noto-arabic-400.woff2', as: 'font', type: 'font/woff2', crossorigin: true }
];

// Mobile-specific image optimization
export const IMAGE_OPTIMIZATION = {
  // Formats by priority
  PREFERRED_FORMATS: ['webp', 'avif', 'jpg', 'png'],
  
  // Quality settings
  WEBP_QUALITY: 80,
  JPEG_QUALITY: 85,
  PNG_COMPRESSION: 9,
  
  // Size limits
  MAX_WIDTH: 1200,
  MAX_HEIGHT: 800,
  THUMBNAIL_SIZE: 150,
  
  // Responsive breakpoints
  BREAKPOINTS: [320, 480, 768, 1024, 1200],
  
  // Lazy loading
  INTERSECTION_MARGIN: '50px',
  LOAD_DELAY: 100
};

// Service worker configuration
export const SW_CONFIG = {
  VERSION: '1.2.0',
  CACHE_NAME_PREFIX: 'indoquran-mobile',
  
  // Cache strategies
  STATIC_CACHE_STRATEGY: 'cache-first',
  DYNAMIC_CACHE_STRATEGY: 'network-first',
  API_CACHE_STRATEGY: 'stale-while-revalidate',
  IMAGE_CACHE_STRATEGY: 'cache-first',
  
  // Cache sizes (mobile optimized)
  MAX_STATIC_CACHE_SIZE: 20 * 1024 * 1024,  // 20MB
  MAX_DYNAMIC_CACHE_SIZE: 15 * 1024 * 1024, // 15MB
  MAX_IMAGE_CACHE_SIZE: 10 * 1024 * 1024,   // 10MB
  MAX_API_CACHE_SIZE: 5 * 1024 * 1024,      // 5MB
  
  // Cache expiration
  STATIC_CACHE_TTL: 7 * 24 * 60 * 60 * 1000,  // 7 days
  DYNAMIC_CACHE_TTL: 24 * 60 * 60 * 1000,     // 1 day
  API_CACHE_TTL: 60 * 60 * 1000,              // 1 hour
  IMAGE_CACHE_TTL: 30 * 24 * 60 * 60 * 1000,  // 30 days
  
  // Network timeouts
  NETWORK_TIMEOUT: 3000, // 3 seconds
  OFFLINE_FALLBACK: true
};

export default {
  MOBILE_PERFORMANCE_CONFIG,
  getNetworkAwareConfig,
  getDeviceOptimizations,
  PERFORMANCE_BUDGETS,
  MONITORING_CONFIG,
  CRITICAL_RESOURCE_HINTS,
  IMAGE_OPTIMIZATION,
  SW_CONFIG
};
