// Enhanced Service Worker for IndoQuran - Mobile Performance Optimized

const CACHE_NAME = 'indoquran-v1.2.0';
const STATIC_CACHE_NAME = `${CACHE_NAME}-static`;
const DYNAMIC_CACHE_NAME = `${CACHE_NAME}-dynamic`;
const API_CACHE_NAME = `${CACHE_NAME}-api`;
const IMAGE_CACHE_NAME = `${CACHE_NAME}-images`;
const FONT_CACHE_NAME = `${CACHE_NAME}-fonts`;

// Critical resources to cache immediately (reduced for mobile)
const STATIC_ASSETS = [
    '/',
    '/build/assets/app.css',
    '/build/assets/app.js',
    '/favicon.ico',
    '/android-chrome-192x192.png',
    '/manifest.json',
];

// API endpoints to cache with different strategies
const API_CACHE_PATTERNS = [
    /\/api\/surahs/,
    /\/api\/ayahs/,
    /\/api\/search/,
    /\/api\/prayer/,
];

// Image patterns to cache
const IMAGE_PATTERNS = [
    /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
];

// Font patterns to cache
const FONT_PATTERNS = [
    /\.(?:woff|woff2|ttf|eot)$/,
    /fonts\.googleapis\.com/,
    /fonts\.gstatic\.com/,
    /fonts\.bunny\.net/,
];

// Cache strategies optimized for mobile
const CACHE_STRATEGIES = {
    CACHE_FIRST: 'cache-first',
    NETWORK_FIRST: 'network-first',
    STALE_WHILE_REVALIDATE: 'stale-while-revalidate'
};

// Cache duration settings (optimized for mobile data usage)
const CACHE_DURATIONS = {
    STATIC: 7 * 24 * 60 * 60 * 1000, // 7 days
    DYNAMIC: 24 * 60 * 60 * 1000,     // 1 day
    API: 60 * 60 * 1000,              // 1 hour
    IMAGES: 30 * 24 * 60 * 60 * 1000, // 30 days
    FONTS: 30 * 24 * 60 * 60 * 1000,  // 30 days
};

// Storage quota management for mobile devices
const MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB limit for mobile

self.addEventListener('install', event => {
    console.log('SW: Installing enhanced service worker v1.2.0');
    
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then(cache => {
                console.log('SW: Pre-caching critical assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .catch(error => {
                console.error('SW: Error pre-caching static assets:', error);
            })
            .then(() => {
                console.log('SW: Installation complete');
                return self.skipWaiting();
            })
    );
});

self.addEventListener('activate', event => {
    console.log('SW: Activating service worker');
    
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE_NAME && 
                            cacheName !== DYNAMIC_CACHE_NAME && 
                            cacheName !== API_CACHE_NAME && 
                            cacheName !== IMAGE_CACHE_NAME &&
                            cacheName !== FONT_CACHE_NAME) {
                            console.log('SW: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            // Check and manage storage quota
            manageStorageQuota(),
            // Claim clients immediately
            self.clients.claim()
        ])
    );
});

self.addEventListener('fetch', event => {
    // Skip non-GET requests and extension requests
    if (event.request.method !== 'GET' || 
        event.request.url.includes('extension') ||
        event.request.url.includes('chrome-extension')) {
        return;
    }
    
    event.respondWith(handleFetch(event.request));
});

// Enhanced fetch handler with mobile optimizations
async function handleFetch(request) {
    const url = new URL(request.url);
    
    try {
        // Strategy 1: Cache First for static assets
        if (isStaticAsset(url)) {
            return await cacheFirst(request, STATIC_CACHE_NAME);
        }
        
        // Strategy 2: Cache First for fonts (critical for mobile)
        if (isFontRequest(url)) {
            return await cacheFirst(request, FONT_CACHE_NAME);
        }
        
        // Strategy 3: Cache First for images with size optimization
        if (isImageRequest(url)) {
            return await cacheFirstWithSizeLimit(request, IMAGE_CACHE_NAME);
        }
        
        // Strategy 4: Stale While Revalidate for API calls
        if (isAPIRequest(url)) {
            return await staleWhileRevalidate(request, API_CACHE_NAME);
        }
        
        // Strategy 5: Network First for HTML pages with timeout
        if (isHTMLRequest(request)) {
            return await networkFirstWithTimeout(request, DYNAMIC_CACHE_NAME, 3000);
        }
        
        // Default: Network with cache fallback
        return await networkWithFallback(request);
        
    } catch (error) {
        console.warn('SW: Fetch error:', error);
        return await getCachedResponse(request) || await getOfflinePage();
    }
}

// Cache First Strategy with size checking
async function cacheFirstWithSizeLimit(request, cacheName) {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Check if it's a large image and skip caching if necessary
            const contentLength = networkResponse.headers.get('content-length');
            if (contentLength && parseInt(contentLength) > 1024 * 1024) { // Skip files > 1MB
                return networkResponse;
            }
            
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.warn('SW: Network request failed:', request.url);
        throw error;
    }
}

// Network First with timeout for better mobile experience
async function networkFirstWithTimeout(request, cacheName, timeout = 3000) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const networkResponse = await fetch(request, {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        console.warn('SW: Network timeout or error, trying cache:', request.url);
        
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        throw error;
    }
}

// Storage quota management for mobile devices
async function manageStorageQuota() {
    try {
        const estimate = await navigator.storage.estimate();
        const usedSpace = estimate.usage || 0;
        const availableSpace = estimate.quota || 0;
        
        console.log(`SW: Storage usage: ${(usedSpace / 1024 / 1024).toFixed(2)}MB / ${(availableSpace / 1024 / 1024).toFixed(2)}MB`);
        
        // If using more than 80% of quota or exceeding our limit, clean up
        if (usedSpace > availableSpace * 0.8 || usedSpace > MAX_CACHE_SIZE) {
            await cleanupOldCaches();
        }
    } catch (error) {
        console.warn('SW: Storage quota check failed:', error);
    }
}

// Clean up old cache entries
async function cleanupOldCaches() {
    console.log('SW: Starting cache cleanup');
    
    const cacheNames = [IMAGE_CACHE_NAME, DYNAMIC_CACHE_NAME];
    
    for (const cacheName of cacheNames) {
        try {
            const cache = await caches.open(cacheName);
            const keys = await cache.keys();
            
            // Remove oldest 50% of entries
            const keysToDelete = keys.slice(0, Math.floor(keys.length / 2));
            
            await Promise.all(
                keysToDelete.map(key => cache.delete(key))
            );
            
            console.log(`SW: Cleaned up ${keysToDelete.length} entries from ${cacheName}`);
        } catch (error) {
            console.warn(`SW: Cleanup failed for ${cacheName}:`, error);
        }
    }
}

// Helper functions (optimized)
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

// Standard cache strategies
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

async function networkWithFallback(request) {
    try {
        return await fetch(request);
    } catch (error) {
        return await caches.match(request) || await getOfflinePage();
    }
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
    return await caches.match('/offline.html') || new Response(
        '<!DOCTYPE html><html><head><title>Offline</title></head><body><h1>You are offline</h1><p>Please check your internet connection.</p></body></html>',
        { headers: { 'Content-Type': 'text/html' } }
    );
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
    
    if (event.data && event.data.type === 'CLEANUP_CACHE') {
        cleanupOldCaches();
    }
});
