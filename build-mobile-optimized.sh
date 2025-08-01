#!/bin/bash

# Enhanced Production Build Script for Mobile Performance
# This script optimizes the build for mobile PageSpeed performance

echo "🚀 Starting enhanced mobile performance build..."

# Set production environment
export NODE_ENV=production

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf public/build
rm -rf node_modules/.vite

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm ci --production=false
fi

# Pre-build optimizations
echo "⚡ Running pre-build optimizations..."

# Optimize images for mobile
echo "🖼️  Optimizing images for mobile..."
if command -v cwebp >/dev/null 2>&1; then
    # Convert images to WebP for better compression
    find public -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" | while read img; do
        if [ ! -f "${img%.*}.webp" ]; then
            cwebp -q 85 "$img" -o "${img%.*}.webp"
            echo "✅ Converted $img to WebP"
        fi
    done
else
    echo "⚠️  cwebp not found, skipping WebP conversion"
fi

# Build with Vite optimizations
echo "🏗️  Building with Vite optimizations..."
npm run build

# Post-build optimizations
echo "📈 Running post-build optimizations..."

# Compress CSS and JS files
if command -v gzip >/dev/null 2>&1; then
    echo "🗜️  Creating gzip compressed files..."
    find public/build -name "*.css" -o -name "*.js" | while read file; do
        gzip -9 -k "$file"
        echo "✅ Compressed $file"
    done
fi

# Create Brotli compressed files if available
if command -v brotli >/dev/null 2>&1; then
    echo "🗜️  Creating Brotli compressed files..."
    find public/build -name "*.css" -o -name "*.js" | while read file; do
        brotli -q 11 -k "$file"
        echo "✅ Brotli compressed $file"
    done
fi

# Generate critical CSS with PageSpeed optimizations
echo "🎨 Generating critical CSS for PageSpeed performance..."
mkdir -p public/build/assets/css
cat > public/build/assets/css/critical.css << 'EOF'
/* Critical CSS for PageSpeed optimization */
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{font-size:100%;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;font-display:swap;line-height:1.6;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;text-rendering:optimizeSpeed;color:#1f2937;background:#fff}
.loading-container{position:fixed;top:0;left:0;right:0;bottom:0;background:#fff;display:flex;align-items:center;justify-content:center;z-index:9999;contain:layout style paint}
.loading-spinner{width:40px;height:40px;border:3px solid #f3f4f6;border-top:3px solid #10b981;border-radius:50%;animation:spin 1s linear infinite;will-change:transform}
@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
.header-container{position:sticky;top:0;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,0.1);z-index:1000;contain:layout style}
.main-content{min-height:calc(100vh - 64px);contain:layout;padding-top:env(safe-area-inset-top)}
.container{max-width:1200px;margin:0 auto;padding:0 1rem}
h1,h2,h3{font-weight:600;line-height:1.25;margin-bottom:0.5rem}
p{margin-bottom:1rem}
.btn{display:inline-flex;align-items:center;padding:0.5rem 1rem;border-radius:0.375rem;text-decoration:none;border:none;cursor:pointer;font-weight:500;transition:all 150ms ease;contain:layout style}
.btn-primary{background:#10b981;color:#fff}
.btn-primary:hover{background:#059669}
@media(max-width:768px){.container{padding:0 0.75rem}.header-container{height:56px}.main-content{min-height:calc(100vh - 56px);padding-top:calc(env(safe-area-inset-top) + 56px)}.loading-spinner{width:32px;height:32px;border-width:2px}}
@media(max-width:480px){.container{padding:0 0.5rem}}
@media(prefers-reduced-motion:reduce){*{animation-duration:0.01ms!important;animation-iteration-count:1!important;transition-duration:0.01ms!important}}
EOF

# Also create a copy in the root for immediate loading
cp public/build/assets/css/critical.css public/critical.css

# Optimize manifest.json for mobile
echo "📱 Optimizing PWA manifest for mobile..."
cat > public/manifest.json << 'EOF'
{
  "name": "IndoQuran - Al-Quran Digital Indonesia",
  "short_name": "IndoQuran",
  "description": "Platform Al-Quran Digital terlengkap di Indonesia",
  "start_url": "/?utm_source=pwa",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#22c55e",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "categories": ["education", "lifestyle", "books"],
  "lang": "id",
  "scope": "/",
  "prefer_related_applications": false
}
EOF

# Generate optimized service worker for PageSpeed
echo "👷 Generating PageSpeed optimized service worker..."
cat > public/sw-mobile.js << 'EOF'
const CACHE_NAME = 'indoquran-mobile-v2';
const STATIC_CACHE = 'static-v2';
const DYNAMIC_CACHE = 'dynamic-v2';
const IMAGE_CACHE = 'images-v2';

// Performance-focused cache limits
const MAX_STATIC_ITEMS = 50;
const MAX_DYNAMIC_ITEMS = 30;
const MAX_IMAGE_ITEMS = 40;

// Critical resources to cache immediately
const CRITICAL_CACHE = [
  '/',
  '/build/assets/css/critical.css',
  '/manifest.json'
];

// Cache strategies
const STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// Install event - cache critical resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        return cache.addAll(CRITICAL_CACHE);
      })
      .then(() => self.skipWaiting())
      .catch(err => console.error('Install failed:', err))
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (!cacheName.includes('v2')) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      self.clients.claim()
    ])
  );
});

// Fetch event with PageSpeed optimized strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and non-HTTP(S) URLs
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }

  // Strategy selection based on resource type
  if (url.pathname.startsWith('/api/')) {
    // Network first for API calls
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
  } else if (request.destination === 'image') {
    // Cache first for images with WebP support
    event.respondWith(cacheFirstWithWebP(request, IMAGE_CACHE));
  } else if (url.pathname.includes('/build/assets/')) {
    // Cache first for build assets
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else {
    // Stale while revalidate for other content
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
  }
});

// Cache strategies implementation
async function cacheFirst(request, cacheName) {
  try {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    const response = await fetch(request);
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return caches.match(request) || new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    return cached || new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then(response => {
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);
  
  return cached || fetchPromise;
}

async function cacheFirstWithWebP(request, cacheName) {
  const cache = await caches.open(cacheName);
  
  // Try WebP version first
  const webpUrl = request.url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
  const webpRequest = new Request(webpUrl);
  const webpCached = await cache.match(webpRequest);
  
  if (webpCached) {
    return webpCached;
  }
  
  // Fallback to original format
  const cached = await cache.match(request);
  if (cached) {
    return cached;
  }
  
  try {
    // Try to fetch WebP first
    const webpResponse = await fetch(webpRequest);
    if (webpResponse.status === 200) {
      cache.put(webpRequest, webpResponse.clone());
      return webpResponse;
    }
  } catch (e) {
    // WebP failed, try original
  }
  
  // Fetch original format
  const response = await fetch(request);
  if (response.status === 200) {
    cache.put(request, response.clone());
  }
  return response;
}

// Background sync for performance data
self.addEventListener('sync', event => {
  if (event.tag === 'performance-sync') {
    event.waitUntil(syncPerformanceData());
  }
});

async function syncPerformanceData() {
  // Send performance metrics when back online
  const data = await getStoredPerformanceData();
  if (data.length > 0) {
    try {
      await fetch('/api/performance-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      clearStoredPerformanceData();
    } catch (e) {
      // Will retry on next sync
    }
  }
}

function getStoredPerformanceData() {
  // Implementation would get data from IndexedDB
  return Promise.resolve([]);
}

function clearStoredPerformanceData() {
  // Implementation would clear IndexedDB
}
EOF

# Calculate bundle sizes
# Generate enhanced service worker registration script
echo "� Generating enhanced service worker registration..."
cat > public/sw-register.js << 'EOF'
// Enhanced Service Worker Registration for PageSpeed
(function() {
  'use strict';
  
  if (!('serviceWorker' in navigator)) {
    return;
  }
  
  // Register service worker with performance optimizations
  function registerSW() {
    navigator.serviceWorker.register('/sw-mobile.js', {
      scope: '/',
      updateViaCache: 'none'
    }).then(registration => {
      console.log('SW: Registered successfully');
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New version available
            showUpdateAvailable();
          }
        });
      });
      
      // Periodic update check
      setInterval(() => {
        registration.update();
      }, 5 * 60 * 1000); // Check every 5 minutes
      
    }).catch(error => {
      console.log('SW: Registration failed', error);
    });
  }
  
  // Show update notification
  function showUpdateAvailable() {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('IndoQuran Update Available', {
        body: 'A new version is available. Refresh to update.',
        icon: '/android-chrome-192x192.png',
        badge: '/android-chrome-192x192.png',
        tag: 'app-update'
      });
    }
  }
  
  // Handle service worker messages
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data.type === 'PERFORMANCE_DATA') {
      // Store performance data
      storePerformanceData(event.data.payload);
    }
  });
  
  // Store performance data for sync
  function storePerformanceData(data) {
    if ('indexedDB' in window) {
      const request = indexedDB.open('IndoQuranDB', 1);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['performance'], 'readwrite');
        const store = transaction.objectStore('performance');
        store.add({
          ...data,
          timestamp: Date.now(),
          synced: false
        });
      };
    }
  }
  
  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', registerSW);
  } else {
    registerSW();
  }
  
  // Handle controller changes
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!window.isRefreshing) {
      window.isRefreshing = true;
      window.location.reload();
    }
  });
  
})();
EOF

# Performance monitoring and Core Web Vitals setup
echo "📊 Setting up performance monitoring..."
cat > public/performance-monitor.js << 'EOF'
// Core Web Vitals monitoring for PageSpeed optimization
(function() {
  'use strict';
  
  // Performance metrics collection
  const metrics = {
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    navigationTiming: null
  };
  
  // Measure Time to First Byte (TTFB)
  function measureTTFB() {
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      metrics.ttfb = navigation.responseStart - navigation.requestStart;
      metrics.navigationTiming = {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        redirect: navigation.redirectEnd - navigation.redirectStart,
        dns: navigation.domainLookupEnd - navigation.domainLookupStart,
        connect: navigation.connectEnd - navigation.connectStart,
        request: navigation.responseStart - navigation.requestStart,
        response: navigation.responseEnd - navigation.responseStart,
        domInteractive: navigation.domInteractive - navigation.fetchStart
      };
    }
  }
  
  // Measure First Contentful Paint (FCP)
  function measureFCP() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          metrics.fcp = entry.startTime;
          observer.disconnect();
          break;
        }
      }
    });
    observer.observe({ entryTypes: ['paint'] });
  }
  
  // Measure Largest Contentful Paint (LCP)
  function measureLCP() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        metrics.lcp = entry.startTime;
      }
    });
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
    
    // Stop observing after page load
    window.addEventListener('load', () => {
      setTimeout(() => observer.disconnect(), 2000);
    });
  }
  
  // Measure First Input Delay (FID)
  function measureFID() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.processingStart > entry.startTime) {
          metrics.fid = entry.processingStart - entry.startTime;
          observer.disconnect();
          break;
        }
      }
    });
    observer.observe({ entryTypes: ['first-input'] });
  }
  
  // Measure Cumulative Layout Shift (CLS)
  function measureCLS() {
    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      }
      metrics.cls = clsValue;
    });
    observer.observe({ entryTypes: ['layout-shift'] });
  }
  
  // Get device and network info
  function getDeviceInfo() {
    return {
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio || 1
      },
      screen: {
        width: screen.width,
        height: screen.height,
        colorDepth: screen.colorDepth
      },
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData
      } : null,
      memory: performance.memory ? {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
      } : null
    };
  }
  
  // Send metrics to backend or service worker
  function sendMetrics() {
    const deviceInfo = getDeviceInfo();
    const perfData = {
      ...metrics,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      pageLoadTime: performance.now(),
      ...deviceInfo
    };
    
    // Send to service worker if available
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'PERFORMANCE_DATA',
        payload: perfData
      });
    }
    
    // Also try to send directly to backend
    if (navigator.sendBeacon) {
      const data = JSON.stringify(perfData);
      navigator.sendBeacon('/api/performance-metrics', data);
    } else {
      fetch('/api/performance-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(perfData),
        keepalive: true
      }).catch(() => {
        // Silent fail for performance metrics
      });
    }
  }
  
  // Initialize all measurements
  function init() {
    measureTTFB();
    measureFCP();
    measureLCP();
    measureFID();
    measureCLS();
    
    // Send metrics after page is fully loaded
    window.addEventListener('load', () => {
      setTimeout(sendMetrics, 3000);
    });
    
    // Send metrics when leaving the page
    window.addEventListener('beforeunload', sendMetrics);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        sendMetrics();
      }
    });
    
    // Expose metrics for debugging
    if (window.location.search.includes('debug=performance')) {
      window.indoquranMetrics = metrics;
      console.log('Performance metrics:', metrics);
    }
  }
  
  // Start monitoring when ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
})();
EOF

echo "📊 Bundle size analysis:"
if [ -d "public/build/assets" ]; then
    echo "CSS files:"
    find public/build/assets -name "*.css" -exec ls -lh {} \; | awk '{print $5 " " $9}'
    echo "JS files:"
    find public/build/assets -name "*.js" -exec ls -lh {} \; | awk '{print $5 " " $9}'
    echo ""
    
    # Calculate total sizes
    css_size=$(find public/build/assets -name "*.css" -exec cat {} \; | wc -c)
    js_size=$(find public/build/assets -name "*.js" -exec cat {} \; | wc -c)
    
    echo "📈 Total bundle sizes:"
    echo "CSS: $(echo $css_size | awk '{printf "%.1f KB", $1/1024}')"
    echo "JS: $(echo $js_size | awk '{printf "%.1f KB", $1/1024}')"
    echo "Total: $(echo $(($css_size + $js_size)) | awk '{printf "%.1f KB", $1/1024}')"
fi

# Performance recommendations
echo ""
echo "📱 Mobile Performance Recommendations:"
echo "✅ Use WebP images with fallbacks"
echo "✅ Enable gzip/brotli compression on server"
echo "✅ Implement proper cache headers"
echo "✅ Use a CDN for static assets"
echo "✅ Monitor Core Web Vitals in production"

# Test if build was successful
if [ -d "public/build/assets" ] && [ $(find public/build/assets -name "*.js" | wc -l) -gt 0 ] && [ $(find public/build/assets -name "*.css" | wc -l) -gt 0 ]; then
    echo ""
    echo "✅ Mobile-optimized build completed successfully!"
    echo "🚀 Ready for deployment with enhanced mobile performance"
    echo ""
    echo "📋 Built files:"
    echo "   CSS: $(find public/build/assets -name "*.css" | wc -l) files"
    echo "   JS: $(find public/build/assets -name "*.js" | wc -l) files" 
    echo "   Compressed: $(find public/build/assets -name "*.gz" | wc -l) gzip files"
    echo "   WebP images: $(find public -name "*.webp" | wc -l) files"
else
    echo ""
    echo "❌ Build failed - please check the errors above"
    exit 1
fi
