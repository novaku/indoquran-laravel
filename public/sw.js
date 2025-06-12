// Service Worker for IndoQuran - SEO optimized caching
// Domain: my.indoquran.web.id
// Improves performance and SEO by serving cached content when possible

const CACHE_NAME = 'indoquran-cache-v2.0';
const API_CACHE_NAME = 'indoquran-api-cache-v2.0';
const IMAGE_CACHE_NAME = 'indoquran-images-cache-v2.0';

// Critical assets to cache on install for better SEO scores
const STATIC_ASSETS = [
  '/',
  '/build/assets/app.css',
  '/build/assets/app.js',
  '/android-chrome-512x512.png',
  '/android-chrome-192x192.png',
  '/apple-touch-icon.png',
  '/favicon.ico',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/site.webmanifest',
  '/robots.txt'
];

// API endpoints to cache for better performance
const API_ENDPOINTS = [
  '/api/surahs',
  '/api/prayer-times',
  '/api/search'
];

// Install event - cache critical assets for SEO
self.addEventListener('install', (event) => {
  console.log('IndoQuran Service Worker installing...');
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then(cache => {
        console.log('Caching critical static assets for SEO');
        return cache.addAll(STATIC_ASSETS);
      }),
      caches.open(IMAGE_CACHE_NAME).then(cache => {
        console.log('Initializing image cache');
        return Promise.resolve();
      })
    ])
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Handle API requests with Network First strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      networkFirstStrategy(event.request, API_CACHE_NAME)
    );
    return;
  }
  
  // Handle static assets with Cache First strategy
  if (isStaticAsset(url.pathname)) {
    event.respondWith(
      cacheFirstStrategy(event.request, CACHE_NAME)
    );
    return;
  }
  
  // Handle navigation requests with Network First strategy
  if (event.request.mode === 'navigate') {
    event.respondWith(
      networkFirstStrategy(event.request, CACHE_NAME)
    );
    return;
  }
  
  // Default to network
  event.respondWith(fetch(event.request));
});

// Network First strategy - try network, fallback to cache
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If it's an API request, return a custom offline response
    if (request.url.includes('/api/')) {
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'Koneksi internet tidak tersedia. Silakan coba lagi nanti.',
          offline: true
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    throw error;
  }
}

// Cache First strategy - try cache, fallback to network
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    throw error;
  }
}

// Check if the request is for a static asset
function isStaticAsset(pathname) {
  const staticExtensions = ['.css', '.js', '.woff2', '.woff', '.ttf', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico'];
  return staticExtensions.some(ext => pathname.endsWith(ext)) || pathname.startsWith('/build/');
}

// Background sync for failed API requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Retry failed requests stored in IndexedDB
      retryFailedRequests()
    );
  }
});

async function retryFailedRequests() {
  // Implementation for retrying failed requests
  // This would integrate with IndexedDB to store and retry failed requests
  console.log('Retrying failed requests...');
}
