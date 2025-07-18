// Service Worker for IndoQuran - Enhanced Caching Strategy for Mobile Performance

const CACHE_NAME = 'indoquran-v1.1.0';
const STATIC_CACHE_NAME = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE_NAME = `${CACHE_NAME}-dynamic`;
const API_CACHE_NAME = `${CACHE_NAME}-api`;
const IMAGE_CACHE_NAME = `${CACHE_NAME}-images`;

// Resources to cache immediately
const STATIC_ASSETS = [
    '/',
    '/build/assets/app.css',
    '/build/assets/app.js',
    '/favicon.ico',
    '/android-chrome-192x192.png',
    '/android-chrome-512x512.png',
    '/apple-touch-icon.png',
    '/manifest.json',
];

// API endpoints to cache
const API_CACHE_PATTERNS = [
    /\/api\/surahs/,
    /\/api\/ayahs/,
    /\/api\/search/,
    /\/api\/prayer/,
    /\/api\/bookmarks/,
];

// Image patterns to cache
const IMAGE_PATTERNS = [
    /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
];

// Cache strategies
const CACHE_STRATEGIES = {
    CACHE_FIRST: 'cache-first',
    NETWORK_FIRST: 'network-first',
    STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// Cache duration settings (in milliseconds)
const CACHE_DURATIONS = {
    STATIC: 7 * 24 * 60 * 60 * 1000, // 7 days
    DYNAMIC: 24 * 60 * 60 * 1000,     // 1 day
    API: 60 * 60 * 1000,              // 1 hour
    IMAGES: 30 * 24 * 60 * 60 * 1000, // 30 days
};

self.addEventListener('install', event => {
    console.log('SW: Installing service worker v1.1.0');
    
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then(cache => {
                console.log('SW: Pre-caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .catch(error => {
                console.error('SW: Error pre-caching static assets:', error);
            })
    );
    
    // Take control immediately
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    console.log('SW: Activating service worker');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (
                        cacheName !== STATIC_CACHE_NAME &&
                        cacheName !== DYNAMIC_CACHE_NAME
                    ) {
                        console.log('SW: Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    
    // Take control of all clients
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Handle different types of requests
    if (isStaticAsset(request)) {
        event.respondWith(handleStaticAsset(request));
    } else if (isAPIRequest(request)) {
        event.respondWith(handleAPIRequest(request));
    } else if (isNavigationRequest(request)) {
        event.respondWith(handleNavigationRequest(request));
    } else {
        event.respondWith(handleDynamicRequest(request));
    }
});

// Check if request is for static assets
function isStaticAsset(request) {
    const url = new URL(request.url);
    return (
        url.pathname.startsWith('/build/') ||
        url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/)
    );
}

// Check if request is for API
function isAPIRequest(request) {
    const url = new URL(request.url);
    return url.pathname.startsWith('/api/');
}

// Check if request is navigation
function isNavigationRequest(request) {
    return request.mode === 'navigate';
}

// Handle static assets with cache-first strategy
function handleStaticAsset(request) {
    return caches.match(request).then(response => {
        if (response) {
            return response;
        }
        
        return fetch(request).then(response => {
            // Cache successful responses
            if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(STATIC_CACHE_NAME).then(cache => {
                    cache.put(request, responseClone);
                });
            }
            return response;
        });
    }).catch(() => {
        // Return fallback for images
        if (request.destination === 'image') {
            return new Response(
                '<svg width="200" height="150" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#6b7280">Image unavailable</text></svg>',
                { headers: { 'Content-Type': 'image/svg+xml' } }
            );
        }
    });
}

// Handle API requests with network-first strategy
function handleAPIRequest(request) {
    return fetch(request)
        .then(response => {
            // Cache successful API responses
            if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(DYNAMIC_CACHE_NAME).then(cache => {
                    cache.put(request, responseClone);
                });
            }
            return response;
        })
        .catch(() => {
            // Return cached version if network fails
            return caches.match(request);
        });
}

// Handle navigation requests
function handleNavigationRequest(request) {
    return fetch(request)
        .then(response => {
            // Cache successful navigation responses
            if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(DYNAMIC_CACHE_NAME).then(cache => {
                    cache.put(request, responseClone);
                });
            }
            return response;
        })
        .catch(() => {
            // Return cached version or offline page
            return caches.match(request).then(response => {
                if (response) {
                    return response;
                }
                // Return offline fallback
                return caches.match('/');
            });
        });
}

// Handle other dynamic requests
function handleDynamicRequest(request) {
    return fetch(request)
        .then(response => {
            if (response.status === 200) {
                const responseClone = response.clone();
                caches.open(DYNAMIC_CACHE_NAME).then(cache => {
                    cache.put(request, responseClone);
                });
            }
            return response;
        })
        .catch(() => {
            return caches.match(request);
        });
}

// Background sync for failed requests
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

function doBackgroundSync() {
    // Implement background sync logic here
    console.log('SW: Performing background sync');
}

// Push notifications (if needed in the future)
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'New update available',
        icon: '/android-chrome-192x192.png',
        badge: '/android-chrome-192x192.png'
    };
    
    event.waitUntil(
        self.registration.showNotification('IndoQuran', options)
    );
});
