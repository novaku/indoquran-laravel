// Service Worker for IndoQuran - Full PWA with offline support
// Support both production and development environments
// Enables installation, offline functionality, and optimized caching

const CACHE_NAME = 'indoquran-cache-v4.0';
const API_CACHE_NAME = 'indoquran-api-cache-v4.0';
const IMAGE_CACHE_NAME = 'indoquran-images-cache-v4.0';
const OFFLINE_CACHE_NAME = 'indoquran-offline-v4.0';

// Critical assets to cache on install for PWA functionality
const STATIC_ASSETS = [
  '/',
  '/apple-touch-icon.png',
  '/favicon.ico',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/site.webmanifest',
  '/robots.txt'
];

// Offline fallback content
const OFFLINE_HTML = `
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Offline - IndoQuran</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex; 
            align-items: center; 
            justify-content: center; 
            min-height: 100vh; 
            margin: 0; 
            background: linear-gradient(135deg, #22c55e 0%, #f59e0b 100%);
            color: white;
            text-align: center;
            padding: 20px;
        }
        .container { 
            max-width: 400px; 
            background: rgba(255,255,255,0.1); 
            padding: 40px 30px; 
            border-radius: 20px; 
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }
        .icon { 
            font-size: 64px; 
            margin-bottom: 20px; 
        }
        h1 { 
            margin: 0 0 10px 0; 
            font-size: 28px;
            font-weight: 600;
        }
        p { 
            margin: 0 0 25px 0; 
            opacity: 0.9;
            line-height: 1.6;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background: rgba(255,255,255,0.2);
            border: 2px solid rgba(255,255,255,0.3);
            border-radius: 12px;
            color: white;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        .button:hover {
            background: rgba(255,255,255,0.3);
            transform: translateY(-2px);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">📖</div>
        <h1>IndoQuran Offline</h1>
        <p>Anda sedang offline. Beberapa fitur mungkin tidak tersedia, tetapi Anda masih dapat mengakses konten yang telah di-cache.</p>
        <a href="/" class="button" onclick="window.location.reload()">Coba Lagi</a>
    </div>
</body>
</html>
`;

// Install event - cache critical assets and offline page
self.addEventListener('install', (event) => {
  console.log('IndoQuran PWA Service Worker installing...');
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then(cache => {
        console.log('Caching critical static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      caches.open(OFFLINE_CACHE_NAME).then(cache => {
        console.log('Caching offline page');
        return cache.put('/offline', new Response(OFFLINE_HTML, {
          headers: { 'Content-Type': 'text/html' }
        }));
      })
    ])
  );
  self.skipWaiting();
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', (event) => {
  console.log('IndoQuran PWA Service Worker activating...');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (!cacheName.includes('v4.0')) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('PWA Service Worker activated and ready');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement comprehensive caching strategies
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip cache for chrome-extension and non-http requests
  if (!event.request.url.startsWith('http')) {
    return;
  }
  
  // Handle API requests with Network First strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(event.request, API_CACHE_NAME));
    return;
  }
  
  // Handle images with Cache First strategy
  if (isImageRequest(event.request)) {
    event.respondWith(cacheFirstStrategy(event.request, IMAGE_CACHE_NAME));
    return;
  }
  
  // Handle static assets with Cache First strategy
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirstStrategy(event.request, CACHE_NAME));
    return;
  }
  
  // Handle navigation requests with Network First + offline fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(navigationStrategy(event.request));
    return;
  }
  
  // Default to network first for everything else
  event.respondWith(networkFirstStrategy(event.request, CACHE_NAME));
});

// Network First strategy - try network, fallback to cache
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for API requests
    if (request.url.includes('/api/')) {
      return new Response(
        JSON.stringify({
          status: 'error',
          message: 'Tidak ada koneksi internet. Aplikasi berjalan dalam mode offline.',
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
    
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Return a fallback for images
    if (isImageRequest(request)) {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f3f4f6"/><text x="100" y="100" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="sans-serif" font-size="14">Gambar tidak tersedia</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    throw error;
  }
}

// Navigation strategy - network first with offline fallback
async function navigationStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Try to serve from cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Serve offline page as last resort
    const offlineResponse = await caches.match('/offline');
    if (offlineResponse) {
      return offlineResponse;
    }
    
    // If no offline page, return basic offline response
    return new Response(OFFLINE_HTML, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Check if the request is for a static asset
function isStaticAsset(pathname) {
  const staticExtensions = ['.css', '.js', '.woff2', '.woff', '.ttf', '.ico', '.webmanifest'];
  return staticExtensions.some(ext => pathname.endsWith(ext)) || 
         pathname.startsWith('/build/') || 
         pathname.startsWith('/assets/');
}

// Check if the request is for an image
function isImageRequest(request) {
  return request.destination === 'image' || 
         /\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(new URL(request.url).pathname);
}

// Push notification support
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/android-chrome-192x192.png',
    badge: '/android-chrome-192x192.png',
    tag: 'indoquran-notification',
    renotify: true,
    actions: [
      {
        action: 'open',
        title: 'Buka',
        icon: '/android-chrome-192x192.png'
      },
      {
        action: 'close',
        title: 'Tutup'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'IndoQuran', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Message handling for communication with main app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

console.log('IndoQuran PWA Service Worker loaded successfully');
