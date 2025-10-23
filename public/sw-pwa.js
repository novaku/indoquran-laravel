// Service Worker for IndoQuran PWA - Enhanced for Installation and Offline Support

const CACHE_NAME = 'indoquran-pwa-v1.2.0';
const STATIC_CACHE_NAME = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE_NAME = `${CACHE_NAME}-dynamic`;
const API_CACHE_NAME = `${CACHE_NAME}-api`;
const IMAGE_CACHE_NAME = `${CACHE_NAME}-images`;
const FONT_CACHE_NAME = `${CACHE_NAME}-fonts`;

// Essential resources for offline functionality
const CRITICAL_ASSETS = [
    '/',
    '/offline',
    '/manifest.json',
    '/favicon.ico',
    '/android-chrome-192x192.png',
    '/android-chrome-512x512.png',
];

// Static assets to cache
// Note: Don't hardcode build assets as they have hashed filenames
// The manifest.json already contains the correct asset paths
const STATIC_ASSETS = [
    '/apple-touch-icon.png',
    '/favicon-16x16.png',
    '/favicon-32x32.png',
];

// API endpoints to cache for offline access
const API_CACHE_PATTERNS = [
    /\/api\/surahs/,
    /\/api\/ayahs/,
    /\/api\/search/,
    /\/api\/prayer/,
    /\/api\/bookmarks/,
    /\/api\/user/,
];

// Font patterns to cache
const FONT_PATTERNS = [
    /\.(?:woff|woff2|ttf|eot)$/,
    /fonts\.googleapis\.com/,
    /fonts\.gstatic\.com/,
    /fonts\.bunny\.net/,
];

// Image patterns to cache
const IMAGE_PATTERNS = [
    /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
];

// Cache duration settings (in milliseconds)
const CACHE_DURATIONS = {
    STATIC: 30 * 24 * 60 * 60 * 1000, // 30 days
    DYNAMIC: 7 * 24 * 60 * 60 * 1000,  // 7 days
    API: 2 * 60 * 60 * 1000,           // 2 hours
    IMAGES: 30 * 24 * 60 * 60 * 1000,  // 30 days
    FONTS: 365 * 24 * 60 * 60 * 1000,  // 1 year
};

// Install event - cache critical resources
self.addEventListener('install', event => {
    console.log('SW: Installing IndoQuran PWA v1.2.0');
    
    event.waitUntil(
        Promise.all([
            // Cache critical assets
            caches.open(STATIC_CACHE_NAME).then(cache => {
                console.log('SW: Pre-caching critical assets');
                return cache.addAll(CRITICAL_ASSETS);
            }),
            // Cache static assets
            caches.open(STATIC_CACHE_NAME).then(cache => {
                console.log('SW: Pre-caching static assets');
                return cache.addAll(STATIC_ASSETS).catch(error => {
                    console.warn('SW: Some static assets failed to cache:', error);
                });
            })
        ]).catch(error => {
            console.error('SW: Error during installation:', error);
        })
    );
    
    // Take control immediately
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('SW: Activating IndoQuran PWA');
    
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(cacheName => 
                            cacheName.startsWith('indoquran-') && 
                            !cacheName.includes('v1.2.0')
                        )
                        .map(cacheName => {
                            console.log('SW: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            }),
            // Take control of all pages
            self.clients.claim()
        ])
    );
});

// Fetch event - handle all network requests
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-HTTP requests
    if (!request.url.startsWith('http')) return;
    
    // Skip Chrome extension requests
    if (url.protocol === 'chrome-extension:') return;
    
    event.respondWith(handleFetch(request));
});

// Main fetch handler with different strategies
async function handleFetch(request) {
    const url = new URL(request.url);
    
    try {
        // Strategy 1: Cache First for static assets
        if (isStaticAsset(url)) {
            return await cacheFirst(request, STATIC_CACHE_NAME);
        }
        
        // Strategy 2: Cache First for fonts
        if (isFontRequest(url)) {
            return await cacheFirst(request, FONT_CACHE_NAME);
        }
        
        // Strategy 3: Cache First for images
        if (isImageRequest(url)) {
            return await cacheFirst(request, IMAGE_CACHE_NAME);
        }
        
        // Strategy 4: Stale While Revalidate for API calls
        if (isAPIRequest(url)) {
            return await staleWhileRevalidate(request, API_CACHE_NAME);
        }
        
        // Strategy 5: Network First for HTML pages
        if (isHTMLRequest(request)) {
            return await networkFirst(request, DYNAMIC_CACHE_NAME);
        }
        
        // Default: Network First
        return await networkFirst(request, DYNAMIC_CACHE_NAME);
        
    } catch (error) {
        console.error('SW: Error handling fetch:', error);
        
        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
            return await getOfflinePage();
        }
        
        // Return cached version or error
        const cachedResponse = await getCachedResponse(request);
        return cachedResponse || new Response('Offline - Content not available', {
            status: 503,
            statusText: 'Service Unavailable'
        });
    }
}

// Cache First Strategy
async function cacheFirst(request, cacheName) {
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
        console.warn('SW: Network request failed:', request.url);
        throw error;
    }
}

// Network First Strategy
async function networkFirst(request, cacheName) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.warn('SW: Network request failed, trying cache:', request.url);
        
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        throw error;
    }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidate(request, cacheName) {
    const cachedResponse = await caches.match(request);
    
    // Update cache in background
    const networkPromise = fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
            const cache = caches.open(cacheName);
            cache.then(c => c.put(request, networkResponse.clone()));
        }
        return networkResponse;
    }).catch(() => {
        // Ignore network errors for background updates
    });
    
    // Return cached version immediately if available
    if (cachedResponse) {
        return cachedResponse;
    }
    
    // If no cache, wait for network
    return await networkPromise;
}

// Helper functions
function isStaticAsset(url) {
    return url.pathname.includes('/build/assets/') || 
           url.pathname.includes('/assets/') ||
           STATIC_ASSETS.some(asset => url.pathname.endsWith(asset));
}

function isFontRequest(url) {
    return FONT_PATTERNS.some(pattern => pattern.test(url.href));
}

function isImageRequest(url) {
    return IMAGE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

function isAPIRequest(url) {
    return API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname));
}

function isHTMLRequest(request) {
    return request.headers.get('accept')?.includes('text/html');
}

async function getCachedResponse(request) {
    const cacheNames = [STATIC_CACHE_NAME, DYNAMIC_CACHE_NAME, API_CACHE_NAME, IMAGE_CACHE_NAME, FONT_CACHE_NAME];
    
    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const response = await cache.match(request);
        if (response) return response;
    }
    
    return null;
}

async function getOfflinePage() {
    const cache = await caches.open(STATIC_CACHE_NAME);
    let offlinePage = await cache.match('/offline');
    
    if (!offlinePage) {
        offlinePage = new Response(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>IndoQuran - Offline</title>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; background: #f8faf8; }
                    .container { max-width: 400px; margin: 0 auto; }
                    .offline-icon { font-size: 64px; margin-bottom: 20px; }
                    h1 { color: #22c55e; margin-bottom: 10px; }
                    h2 { color: #374151; margin-bottom: 20px; }
                    p { color: #6b7280; margin: 20px 0; line-height: 1.6; }
                    .retry-btn { 
                        background: #22c55e; 
                        color: white; 
                        padding: 12px 24px; 
                        border: none; 
                        border-radius: 8px; 
                        cursor: pointer; 
                        font-size: 16px;
                        font-weight: 500;
                        margin: 10px;
                        transition: background 0.2s;
                    }
                    .retry-btn:hover { background: #16a34a; }
                    .secondary-btn {
                        background: #e5e7eb;
                        color: #374151;
                    }
                    .secondary-btn:hover { background: #d1d5db; }
                    .features {
                        text-align: left;
                        background: white;
                        padding: 20px;
                        border-radius: 8px;
                        margin-top: 30px;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    }
                    .feature { margin: 10px 0; color: #374151; }
                    .feature::before { content: "✓ "; color: #22c55e; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="offline-icon">📖</div>
                    <h1>IndoQuran</h1>
                    <h2>Anda sedang offline</h2>
                    <p>Tidak dapat terhubung ke internet saat ini. Namun, beberapa fitur masih dapat digunakan secara offline.</p>
                    
                    <button class="retry-btn" onclick="window.location.reload()">Coba Lagi</button>
                    <button class="retry-btn secondary-btn" onclick="window.history.back()">Kembali</button>
                    
                    <div class="features">
                        <h3 style="margin-top: 0; color: #374151;">Fitur Offline:</h3>
                        <div class="feature">Data yang sudah dibaca sebelumnya</div>
                        <div class="feature">Bookmark yang tersimpan</div>
                        <div class="feature">Riwayat pencarian</div>
                        <div class="feature">Cache halaman utama</div>
                    </div>
                    
                    <p><small>Aplikasi akan otomatis sinkronisasi ketika koneksi internet kembali normal.</small></p>
                </div>
            </body>
            </html>
        `, {
            headers: { 'Content-Type': 'text/html' }
        });
    }
    
    return offlinePage;
}

// Listen for messages from the app
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({
            version: CACHE_NAME
        });
    }
});

// Background sync for offline actions
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync-bookmarks') {
        event.waitUntil(syncBookmarks());
    }
    
    if (event.tag === 'background-sync-search') {
        event.waitUntil(syncSearchHistory());
    }
});

async function syncBookmarks() {
    try {
        console.log('SW: Syncing bookmarks');
        // Implement bookmark sync logic here
    } catch (error) {
        console.error('SW: Error syncing bookmarks:', error);
    }
}

async function syncSearchHistory() {
    try {
        console.log('SW: Syncing search history');
        // Implement search history sync logic here
    } catch (error) {
        console.error('SW: Error syncing search history:', error);
    }
}

// Push notification support
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'Ada pesan baru dari IndoQuran',
        icon: '/android-chrome-192x192.png',
        badge: '/android-chrome-192x192.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '1'
        },
        actions: [
            {
                action: 'explore',
                title: 'Buka IndoQuran',
                icon: '/android-chrome-192x192.png'
            },
            {
                action: 'close',
                title: 'Tutup',
                icon: '/android-chrome-192x192.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('IndoQuran', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});
