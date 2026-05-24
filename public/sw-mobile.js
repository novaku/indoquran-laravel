const CACHE_NAME = 'indoquran-mobile-v3';
const STATIC_CACHE = 'static-v3';
const DYNAMIC_CACHE = 'dynamic-v3';
const IMAGE_CACHE = 'images-v3';

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
            if (!cacheName.includes('v3')) {
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
