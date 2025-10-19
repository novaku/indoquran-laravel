const CACHE_VERSION = 'v2.0.0';
const CACHE_NAME = `indoquran-${CACHE_VERSION}`;
const RUNTIME_CACHE = `indoquran-runtime-${CACHE_VERSION}`;
const IMAGE_CACHE = `indoquran-images-${CACHE_VERSION}`;
const API_CACHE = `indoquran-api-${CACHE_VERSION}`;

// Critical assets to cache immediately
const STATIC_CACHE_URLS = [
  '/',
  '/manifest.json',
  '/offline.html'
];

// Cache strategies
const CACHE_STRATEGIES = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
  NETWORK_ONLY: 'network-only'
};

// Install event - cache critical resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching critical resources');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('indoquran-') && name !== CACHE_NAME && name !== RUNTIME_CACHE && name !== IMAGE_CACHE && name !== API_CACHE)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // API requests - Network First with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request, API_CACHE, 5000));
    return;
  }

  // Images - Cache First with network fallback
  if (request.destination === 'image' || /\.(png|jpg|jpeg|svg|gif|webp|ico)$/i.test(url.pathname)) {
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE));
    return;
  }

  // JS and CSS - Stale While Revalidate
  if (request.destination === 'script' || request.destination === 'style' || /\.(js|css)$/i.test(url.pathname)) {
    event.respondWith(staleWhileRevalidateStrategy(request, RUNTIME_CACHE));
    return;
  }

  // HTML pages - Network First
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(networkFirstStrategy(request, RUNTIME_CACHE, 3000));
    return;
  }

  // Default - Network First
  event.respondWith(networkFirstStrategy(request, RUNTIME_CACHE, 3000));
});

// Cache First Strategy (for static assets)
async function cacheFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    return cached;
  }
  
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[SW] Cache First failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

// Network First Strategy (for dynamic content)
async function networkFirstStrategy(request, cacheName, timeout = 3000) {
  const cache = await caches.open(cacheName);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[SW] Network First failed, trying cache:', error.message);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlinePage = await cache.match('/offline.html');
      if (offlinePage) {
        return offlinePage;
      }
    }
    
    return new Response('Offline', { 
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Stale While Revalidate Strategy (for assets that can be updated in background)
async function staleWhileRevalidateStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);
  
  return cached || fetchPromise;
}

// Background sync for failed requests
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  if (event.tag === 'sync-bookmarks') {
    event.waitUntil(syncBookmarks());
  }
});

async function syncBookmarks() {
  // Implement bookmark sync logic here
  console.log('[SW] Syncing bookmarks...');
}
