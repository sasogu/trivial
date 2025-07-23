// Versión del caché
const CACHE_VERSION = 'v2.9.67'; // Actualizada con logo automático para modo oscuro
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
  '/logonegro.png',
  '/logoblanco.png'
];

self.addEventListener('install', event => {
  console.log('Service Worker: Instalando v2.9.63...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Limpiando caché anterior y cacheando archivos esenciales');
        // Forzar limpieza inmediata del caché anterior
        return caches.keys().then(keys => {
          const deletePromises = keys
            .filter(key => key.startsWith('trivial-') && key !== CACHE_NAME)
            .map(key => caches.delete(key));
          return Promise.all(deletePromises);
        }).then(() => {
          // Agregar archivos con timestamp para forzar recarga
          const timestampedFiles = ESSENTIAL_FILES.map(file => {
            if (file === '/') return file;
            return `${file}?v=${CACHE_VERSION}&t=${Date.now()}`;
          });
          console.log('Service Worker: Cacheando con timestamp:', timestampedFiles);
          return cache.addAll(ESSENTIAL_FILES); // Usar archivos originales para el caché
        });
      })
      .then(() => {
        console.log('Service Worker: Instalación completa, forzando activación inmediata');
        return self.skipWaiting(); // Forzar activación inmediata
      })
      .catch(error => {
        console.error('Service Worker: Error durante instalación', error);
      })
  );
});

self.addEventListener('activate', event => {
  console.log('Service Worker: Activando v2.9.63...');
  event.waitUntil(
    Promise.all([
      // Limpiar cachés antiguos
      caches.keys().then(keys => {
        const deletePromises = keys
          .filter(key => key.startsWith('trivial-') && key !== CACHE_NAME)
          .map(key => {
            console.log('Service Worker: Eliminando caché antiguo:', key);
            return caches.delete(key);
          });
        return Promise.all(deletePromises);
      }),
      // Forzar reclaim de todos los clientes
      self.clients.claim(),
      // Notificar a todos los clientes que hay una nueva versión
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          console.log('Service Worker: Notificando actualización a cliente');
          client.postMessage({
            type: 'SW_UPDATED',
            version: CACHE_VERSION,
            message: 'Nueva versión disponible. Recarga la página para ver los cambios.'
          });
        });
      })
    ]).then(() => {
      console.log('Service Worker: Activación completa v2.9.62');
    })
  );
});

self.addEventListener('fetch', event => {
  // Solo cachear requests GET
  if (event.request.method !== 'GET') return;
  
  // Ignorar requests a Firebase y otros dominios externos
  if (!event.request.url.startsWith(self.location.origin)) return;
  
  // Estrategia: Network First para archivos críticos, Cache First para otros
  const url = new URL(event.request.url);
  const isCriticalFile = ESSENTIAL_FILES.some(file => {
    if (file === '/') return url.pathname === '/';
    return url.pathname === file || url.pathname.endsWith(file);
  });
  
  if (isCriticalFile) {
    // Network First para archivos críticos (asegura última versión)
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            console.log('Service Worker: Actualizando archivo crítico desde red:', event.request.url);
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseToCache));
            return response;
          }
          throw new Error('Respuesta no válida');
        })
        .catch(error => {
          console.log('Service Worker: Fallback a caché para:', event.request.url);
          return caches.match(event.request);
        })
    );
  } else {
    // Cache First para otros recursos
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
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseToCache));
              
              return response;
            })
            .catch(error => {
              console.error('Service Worker: Error en fetch:', error);
              if (event.request.destination === 'document') {
                return caches.match('/index.html');
              }
            });
        })
    );
  }
});
