// Versión del caché
const CACHE_VERSION = 'v2.8.5'; // Actualiza la versión si cambias los archivos del caché
const CACHE_NAME = `trivial-${CACHE_VERSION}`;

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/style.css',
        '/main.js',
        '/questions.js',
        '/manifest.json',
        '/icon-192.png',
        '/icon-512.png',
        '/logonegro.png' // Añadido el logo al caché
      ]);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key.startsWith('trivial-') && key !== CACHE_NAME)
            .map(key => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
