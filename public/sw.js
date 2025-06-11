// Service Worker for caching API responses and static assets
// This improves performance by serving cached content when possible

const CACHE_NAME = 'indoquran-cache-v1';
const API_CACHE_NAME = 'indoquran-api-cache-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/build/assets/app.css',
  '/build/assets/app.js',
  '/fonts/arabic-font.woff2',
  '/fonts/indonesian-font.woff2',
  '/images/quran-header-bg.jpg',
  '/favicon.ico'
];

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/surahs',
  '/api/prayer-times'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
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
