const CACHE_NAME = 'indoquran-v1.0.0';
const STATIC_CACHE_URLS = [
  '/',
  '/build/assets/app.css',
  '/build/assets/vendor-react-core.js',
  '/build/assets/home.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_CACHE_URLS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      }
    )
  );
});
