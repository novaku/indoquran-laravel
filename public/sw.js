// Service Worker for IndoQuran - Full PWA with offline support
// Support both production and development environments
// Enables installation, offline functionality, and optimized caching

const CACHE_NAME = 'indoquran-cache-v4.2';
const API_CACHE_NAME = 'indoquran-api-cache-v4.2';
const IMAGE_CACHE_NAME = 'indoquran-images-cache-v4.2';
const OFFLINE_CACHE_NAME = 'indoquran-offline-v4.2';

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
  
  // Skip handling for problematic URLs like OpenStreetMap
  if (url.hostname.includes('nominatim.openstreetmap.org')) {
    return; // Let the browser handle these directly
  }

  // Handle CORS issues for production assets in development environment
  const indoQuranDomains = ['indoquran.web.id', 'my.indoquran.web.id'];
  const isIndoQuranResource = indoQuranDomains.some(domain => url.hostname.includes(domain));
  
  // If we detect production assets being loaded in development, try to handle CORS
  if (isIndoQuranResource && (self.location.hostname.includes('127.0.0.1') || self.location.hostname.includes('localhost'))) {
    // For production assets loaded in development, try to provide better CORS handling
    if (url.pathname.includes('/assets/') || url.pathname.includes('/build/') || 
        url.pathname.endsWith('.js') || url.pathname.endsWith('.css')) {
      
      // For JavaScript modules in build directory, ensure correct MIME type
      if ((url.pathname.includes('/build/assets/') || url.pathname.includes('/assets/')) && 
           url.pathname.endsWith('.js')) {
        console.log('Handling module script with proper MIME type:', url.pathname);
        
        const localAssetUrl = new URL(url.pathname, self.location.origin);
        event.respondWith(
          fetch(localAssetUrl)
            .then(response => {
              if (response.ok) {
                console.log('Successfully loaded local asset instead of production:', localAssetUrl.href);
                // Ensure correct MIME type for JavaScript modules
                const contentType = response.headers.get('Content-Type');
                if (!contentType || !contentType.includes('application/javascript')) {
                  return response.blob().then(blob => {
                    return new Response(blob, {
                      status: response.status,
                      statusText: response.statusText,
                      headers: new Headers({
                        ...Object.fromEntries(response.headers.entries()),
                        'Content-Type': 'application/javascript'
                      })
                    });
                  });
                }
                return response;
              }
              // If local asset doesn't exist, try original with CORS mode
              return fetch(event.request, { mode: 'cors', credentials: 'omit' })
                .catch(error => {
                  console.error('CORS error for production asset:', error);
                  if (url.pathname.endsWith('.js')) {
                    return new Response(
                      '/* Failed to load due to CORS - empty fallback provided */\nconsole.warn("Asset failed to load due to CORS: ' + url.href + '");',
                      { headers: { 'Content-Type': 'application/javascript' } }
                    );
                  }
                  if (url.pathname.endsWith('.css')) {
                    return new Response(
                      '/* Failed to load CSS due to CORS - empty fallback provided */',
                      { headers: { 'Content-Type': 'text/css' } }
                    );
                  }
                  throw error;
                });
            })
            .catch(error => {
              console.error('Failed to handle CORS for production asset:', error);
              // Default empty response for JS/CSS to prevent app from breaking
              if (url.pathname.endsWith('.js')) {
                return new Response(
                  '/* Failed to load JS due to CORS - empty fallback provided */',
                  { headers: { 'Content-Type': 'application/javascript' } }
                );
              }
              if (url.pathname.endsWith('.css')) {
                return new Response(
                  '/* Failed to load CSS due to CORS - empty fallback provided */',
                  { headers: { 'Content-Type': 'text/css' } }
                );
              }
              throw error;
            })
        );
        return;
      }
      
      // For other assets, use the existing logic
      const localAssetUrl = new URL(url.pathname, self.location.origin);
      event.respondWith(
        fetch(localAssetUrl)
          .then(response => {
            if (response.ok) {
              console.log('Successfully loaded local asset instead of production:', localAssetUrl.href);
              return response;
            }
            // If local asset doesn't exist, try original with CORS mode
            return fetch(event.request, { mode: 'cors', credentials: 'omit' })
              .catch(error => {
                console.error('CORS error for production asset:', error);
                if (url.pathname.endsWith('.js')) {
                  return new Response(
                    '/* Failed to load due to CORS - empty fallback provided */\nconsole.warn("Asset failed to load due to CORS: ' + url.href + '");',
                    { headers: { 'Content-Type': 'application/javascript' } }
                  );
                }
                if (url.pathname.endsWith('.css')) {
                  return new Response(
                    '/* Failed to load CSS due to CORS - empty fallback provided */',
                    { headers: { 'Content-Type': 'text/css' } }
                  );
                }
                throw error;
              });
          })
          .catch(error => {
            console.error('Failed to handle CORS for production asset:', error);
            // Default empty response for JS/CSS to prevent app from breaking
            if (url.pathname.endsWith('.js')) {
              return new Response(
                '/* Failed to load JS due to CORS - empty fallback provided */',
                { headers: { 'Content-Type': 'application/javascript' } }
              );
            }
            if (url.pathname.endsWith('.css')) {
              return new Response(
                '/* Failed to load CSS due to CORS - empty fallback provided */',
                { headers: { 'Content-Type': 'text/css' } }
              );
            }
            throw error;
          })
      );
      return;
    }
  }

  // Wrap in try-catch to prevent service worker crashes
  try {
    // Handle form submissions in an async-safe way
    if (event.request.method === 'POST') {
      // Process forms specially to ensure proper enctype
      event.respondWith(handleFormSubmission(event.request));
      return;
    }
    
    // Handle JavaScript module files specially to ensure correct MIME type
    if (isJavaScriptModule(event.request)) {
      console.log('Handling JavaScript module with enhanced MIME type checking:', event.request.url);
      event.respondWith(handleJavaScriptModule(event.request));
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
  } catch (error) {
    console.error('Error in fetch event handler:', error, event.request.url);
    // Let the browser handle the request normally if we fail
    return;
  }
});

// Handle JavaScript modules to ensure correct MIME type
async function handleJavaScriptModule(request) {
  const url = new URL(request.url);
  console.log('Handling JavaScript module with MIME type fix:', url.pathname);
  
  try {
    // First try to fetch from network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Get the response body
      const responseBody = await networkResponse.blob();
      
      // Create response with correct MIME type using our helper
      const fixedResponse = createJavaScriptModuleResponse(responseBody);
      
      // Cache the fixed response for future use
      try {
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, fixedResponse.clone());
      } catch (cacheError) {
        console.warn('Failed to cache JavaScript module:', cacheError);
      }
      
      return fixedResponse;
    }
    
    // If network fails, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('Serving JavaScript module from cache:', url.pathname);
      
      // Ensure cached response has correct MIME type
      const contentType = cachedResponse.headers.get('Content-Type');
      if (!contentType || !contentType.includes('application/javascript')) {
        const cachedBody = await cachedResponse.blob();
        return createJavaScriptModuleResponse(cachedBody);
      }
      
      return cachedResponse;
    }
    
    // Return the original response even if it failed
    return networkResponse;
    
  } catch (error) {
    console.error('Error handling JavaScript module:', error, url.pathname);
    
    // Check cache as fallback
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('Using cached fallback for failed JavaScript module:', url.pathname);
      const cachedBody = await cachedResponse.blob();
      return createJavaScriptModuleResponse(cachedBody);
    }
    
    // Return a minimal JavaScript module that won't break the app
    const fallbackContent = `/* Failed to load JavaScript module: ${url.pathname} */
console.warn("Failed to load JavaScript module: ${url.pathname}");
// Export empty object to prevent import errors
export default {};
export { };`;
    
    return createJavaScriptModuleResponse(new Blob([fallbackContent], { type: 'text/plain' }));
  }
}

// Network First strategy - try network, fallback to cache
async function networkFirstStrategy(request, cacheName) {
  try {
    // Skip problematic external requests
    const url = new URL(request.url);
    const skipCacheDomains = ['nominatim.openstreetmap.org'];
    const shouldSkipCache = skipCacheDomains.some(domain => url.hostname.includes(domain));
    
    if (shouldSkipCache) {
      console.log('Skipping problematic URL in networkFirstStrategy:', request.url);
      return fetch(request);
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok && request.method === 'GET') {
      try {
        const cache = await caches.open(cacheName);
        cache.put(request, networkResponse.clone());
      } catch (cacheError) {
        console.error('Failed to cache response in networkFirstStrategy:', cacheError);
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network request failed, trying cache:', request.url);
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
    // Skip external URLs that might cause CORS issues
    const url = new URL(request.url);
    const isExternalRequest = !url.hostname.includes(self.location.hostname) && 
                             !['fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname);
    
    // Handle IndoQuran domains specially (include both local and production domains)
    const indoQuranDomains = ['indoquran.web.id', 'my.indoquran.web.id', '127.0.0.1:8000', 'localhost:8000'];
    const isIndoQuranResource = indoQuranDomains.some(domain => url.hostname.includes(domain));
    
    // Skip caching certain problematic domains
    const skipCacheDomains = ['nominatim.openstreetmap.org'];
    const shouldSkipCache = skipCacheDomains.some(domain => url.hostname.includes(domain));
    
    if (isExternalRequest && !isIndoQuranResource && shouldSkipCache) {
      console.log('Skipping external request in service worker:', request.url);
      return fetch(request);
    }
    
    // Create a modified request for CORS if needed (for IndoQuran resources only)
    let fetchRequest = request;
    if (isIndoQuranResource && !url.hostname.includes(self.location.hostname)) {
      // For IndoQuran resources, we need to handle CORS specially
      // Clone the request and modify it to add CORS mode
      fetchRequest = new Request(request.url, {
        method: request.method,
        headers: request.headers,
        mode: 'cors',
        credentials: 'same-origin',
        redirect: 'follow',
      });
    }
    
    const networkResponse = await fetch(fetchRequest);
    
    if (networkResponse.ok && request.method === 'GET' && !shouldSkipCache) {
      const cache = await caches.open(cacheName);
      try {
        // For JavaScript or CSS files, ensure correct content type
        const url = new URL(request.url);
        if (url.pathname.endsWith('.js') || url.pathname.endsWith('.mjs') || url.pathname.endsWith('.css')) {
          const contentType = networkResponse.headers.get('Content-Type');
          const expectedType = url.pathname.endsWith('.css') 
            ? 'text/css' 
            : 'application/javascript';
          
          if (!contentType || !contentType.includes(expectedType)) {
            console.log(`Fixing Content-Type for ${url.pathname} to ${expectedType}`);
            const body = await networkResponse.clone().blob();
            const fixedResponse = new Response(body, {
              status: networkResponse.status,
              statusText: networkResponse.statusText,
              headers: new Headers({
                ...Object.fromEntries(networkResponse.headers.entries()),
                'Content-Type': expectedType
              })
            });
            cache.put(request, fixedResponse);
            return fixedResponse;
          }
        }
        
        // Normal caching for other file types
        cache.put(request, networkResponse.clone());
      } catch (cacheError) {
        console.error('Failed to cache response:', cacheError);
      }
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Fetch error in cacheFirstStrategy:', error, request.url);
    
    // Special handling for CORS errors
    const url = new URL(request.url);
    if (error.message && error.message.includes('CORS')) {
      console.log('CORS error detected, trying to proxy the request');
      
      // If we're trying to load a JS file from production in development, we can fallback to the local version
      if (url.pathname.includes('/assets/') && (url.pathname.endsWith('.js') || url.pathname.endsWith('.css'))) {
        // Try to load the local version of the asset
        const localUrl = new URL(url.pathname, self.location.origin);
        try {
          const localResponse = await fetch(localUrl);
          if (localResponse.ok) {
            return localResponse;
          }
        } catch (localError) {
          console.error('Failed to fetch local version:', localError);
        }
      }
    }
    
    // Return a fallback for images
    if (isImageRequest(request)) {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f3f4f6"/><text x="100" y="100" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="sans-serif" font-size="14">Gambar tidak tersedia</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    
    // For JavaScript files, return an empty JS file to prevent breaking the app
    if (url.pathname.endsWith('.js')) {
      return new Response(
        '/* Failed to load due to CORS or network error */',
        { headers: { 'Content-Type': 'application/javascript' } }
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

// Handle form submissions properly
async function handleFormSubmission(request) {
  // Check if it's a form submission that might need enctype fixing
  const url = new URL(request.url);
  const contentType = request.headers.get('Content-Type');
  const isContactForm = url.pathname.includes('/contact') || url.pathname.includes('/api/contact');
  
  // Only process forms that need fixing (e.g., contact forms with file uploads)
  if (isContactForm && contentType && !contentType.includes('multipart/form-data')) {
    console.log('Form submission detected, ensuring proper enctype');
    
    try {
      // Clone the request with proper enctype for file uploads
      const newHeaders = new Headers(request.headers);
      newHeaders.set('Content-Type', 'multipart/form-data');
      
      const fixedRequest = new Request(request.url, {
        method: request.method,
        headers: newHeaders,
        body: request.body,
        mode: request.mode,
        credentials: request.credentials,
        cache: request.cache,
        redirect: request.redirect,
        referrer: request.referrer
      });
      
      // Proceed with the fixed request
      return networkFirstStrategy(fixedRequest, CACHE_NAME);
    } catch (error) {
      console.error('Error while fixing form enctype:', error);
      // Fall back to original request if fixing fails
    }
  }
  
  // For multipart/form-data requests, make sure we don't interfere with them
  if (contentType && contentType.includes('multipart/form-data')) {
    console.log('Handling multipart form data request directly');
    // Pass through without modification to ensure browser sets the correct boundary
    return fetch(request);
  }
  
  // Default: proceed with original request
  return networkFirstStrategy(request, CACHE_NAME);
}

// Check if the request is for a static asset
function isStaticAsset(pathname) {
  const staticExtensions = ['.css', '.js', '.mjs', '.woff2', '.woff', '.ttf', '.ico', '.webmanifest'];
  return staticExtensions.some(ext => pathname.endsWith(ext)) || 
         pathname.startsWith('/build/') || 
         pathname.startsWith('/assets/');
}

// Check if request is for a JavaScript module
function isJavaScriptModule(request) {
  const url = new URL(request.url);
  // Enhanced module detection to catch build outputs with hashes (like vendor-BEN4boU2.js)
  return (url.pathname.endsWith('.js') || url.pathname.endsWith('.mjs') || 
          url.pathname.match(/\/[A-Za-z]+-[A-Za-z0-9_]+\.js$/)) && 
         (url.pathname.includes('/build/assets/') || 
          url.pathname.includes('/assets/') ||
          request.destination === 'script' || 
          request.mode === 'cors');
}

// Get the correct content type for a file based on its extension
function getContentTypeByExtension(pathname) {
  const extension = pathname.substring(pathname.lastIndexOf('.'));
  
  switch (extension) {
    case '.js':
    case '.mjs':
      return 'application/javascript';
    case '.css':
      return 'text/css';
    case '.html':
      return 'text/html';
    case '.json':
      return 'application/json';
    case '.png':
      return 'image/png';
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.svg':
      return 'image/svg+xml';
    case '.webp':
      return 'image/webp';
    case '.woff':
      return 'font/woff';
    case '.woff2':
      return 'font/woff2';
    case '.ttf':
      return 'font/ttf';
    case '.webmanifest':
      return 'application/manifest+json';
    default:
      return 'text/plain';
  }
}

// Check if the request is for an image
function isImageRequest(request) {
  return request.destination === 'image' || 
         /\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(new URL(request.url).pathname);
}

// Check if the request is a form submission
function isFormSubmission(request) {
  return request.method === 'POST' && 
         (request.headers.get('Content-Type')?.includes('application/x-www-form-urlencoded') ||
          request.headers.get('Content-Type')?.includes('multipart/form-data') ||
          // Also check for JSON submissions (React forms often use this)
          request.headers.get('Content-Type')?.includes('application/json'));
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

// Enhanced JavaScript module handling for proper MIME type
function createJavaScriptModuleResponse(blob, status = 200, headers = {}) {
  return new Response(blob, {
    status: status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: new Headers({
      ...headers,
      'Content-Type': 'application/javascript; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Cache-Control': 'public, max-age=31536000'
    })
  });
}

// Intercept and fix MIME type errors for JavaScript modules
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.error);
  if (event.error && event.error.message && event.error.message.includes('MIME type')) {
    console.log('Detected MIME type error, service worker may need to handle it');
  }
});

console.log('IndoQuran PWA Service Worker loaded successfully');
