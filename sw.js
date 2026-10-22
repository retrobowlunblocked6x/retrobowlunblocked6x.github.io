/**
 * Retro Bowl Unblocked 6x - Progressive Web App Service Worker
 * Fast offline shell caching & smooth game delivery
 */

const CACHE_NAME = 'retrobowl6x-v3';
const CORE_ASSETS = [
  './',
  'css/style.css?v=3',
  'js/games-data.js?v=3',
  'js/ads.js?v=3',
  'js/app.js?v=3',
  'js/player.js?v=3',
  'manifest.json',
  'favicon.ico',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'images/retro-bowl.png',
  'images/retro-bowl-college.png',
  'images/slope.png',
  'images/basket-random.png',
  'images/2048.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS).catch(err => {
        console.warn('Some cache assets failed to pre-cache:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip cross-origin ad requests, google ads, analytics
  if (!url.origin.includes(self.location.origin) && !url.hostname.includes('fonts.googleapis.com')) {
    return;
  }

  // Network-first for HTML pages and js/data so fresh game updates are immediate
  if (event.request.mode === 'navigate' || url.pathname.endsWith('.js') || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        return caches.match(event.request) || caches.match('./');
      })
    );
    return;
  }

  // Cache-first for images, fonts, static media
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        // Return nothing if network failed
      });
    })
  );
});
