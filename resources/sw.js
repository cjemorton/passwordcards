// Service Worker for Password Card Generator PWA
const CACHE_NAME = 'passwordcards-v1';
const urlsToCache = [
  '/',
  '/resources/css/normalize.css',
  '/resources/css/skeleton.css',
  '/resources/css/tinycolorpicker.css',
  '/resources/css/main.css',
  '/resources/js/jquery-2.1.3.js',
  '/resources/js/jquery.tinycolorpicker.js',
  '/resources/js/index.js',
  '/resources/favicon.png',
  '/resources/cards.png'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache.map(url => new Request(url, {credentials: 'same-origin'})));
      })
      .catch(err => {
        console.log('Cache addAll error:', err);
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(response => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              // Don't cache POST requests
              if (event.request.method === 'GET') {
                cache.put(event.request, responseToCache);
              }
            });

          return response;
        }).catch(err => {
          console.log('Fetch failed:', err);
          // Return a custom offline page if available
          return caches.match('/offline.html');
        });
      })
  );
});
