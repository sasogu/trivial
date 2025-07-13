// Versión del caché
const CACHE_VERSION = 'v2.9.5'; // Actualizada con centrado de texto en botones
const CACHE_NAME = `trivial-${CACHE_VERSION}`;

// Archivos esenciales que siempre deben estar en caché
const ESSENTIAL_FILES = [
  '/',
  '/index.html',
  '/style.css',
  '/main.js',
  '/questions.js',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/logonegro.png'
];

self.addEventListener('install', event => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cacheando archivos esenciales');
        return cache.addAll(ESSENTIAL_FILES);
      })
      .then(() => {
        console.log('Service Worker: Instalación completa');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Error durante instalación', error);
      })
  );
});

self.addEventListener('activate', event => {
  console.log('Service Worker: Activando...');
  event.waitUntil(
    caches.keys()
      .then(keys => {
        const deletePromises = keys
          .filter(key => key.startsWith('trivial-') && key !== CACHE_NAME)
          .map(key => {
            console.log('Service Worker: Eliminando caché antiguo:', key);
            return caches.delete(key);
          });
        return Promise.all(deletePromises);
      })
      .then(() => {
        console.log('Service Worker: Activación completa');
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', event => {
  // Solo cachear requests GET
  if (event.request.method !== 'GET') return;
  
  // Ignorar requests a Firebase y otros dominios externos
  if (!event.request.url.startsWith(self.location.origin)) return;
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          console.log('Service Worker: Sirviendo desde caché:', event.request.url);
          return response;
        }
        
        console.log('Service Worker: Fetching desde red:', event.request.url);
        return fetch(event.request)
          .then(response => {
            // Solo cachear respuestas exitosas
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clonar la respuesta para almacenar en caché
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(error => {
            console.error('Service Worker: Error en fetch:', error);
            // En caso de error de red, intentar servir una página de fallback
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
          });
      })
  );
});
