const CACHE_NAME = 'planilla-app-v2'; // Incrementamos versión para forzar actualización

const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './css/all.min.css',
  // Archivos de fuentes de FontAwesome para asegurar disponibilidad offline
  './webfonts/fa-solid-900.woff2',
  './webfonts/fa-solid-900.ttf',
  './webfonts/fa-regular-400.woff2',
  './webfonts/fa-regular-400.ttf',
  './webfonts/fa-brands-400.woff2',
  './webfonts/fa-brands-400.ttf'
];

// Instalación del Service Worker y almacenamiento en caché de los archivos vitales
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Archivos base en caché guardados con éxito');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error('Error al guardar en caché los archivos:', err))
  );
  self.skipWaiting();
});

// Activación y limpieza de cachés antiguas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Borrando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptación de solicitudes (Estrategia: Buscar en caché, si no está ir a red y guardarlo dinámicamente)
self.addEventListener('fetch', event => {
  // Ignorar peticiones que no sean HTTP/HTTPS (como extensiones del navegador)
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        // Si no está en caché, lo busca en la red y lo clona para guardarlo automáticamente
        return fetch(event.request).then(networkResponse => {
          // Verificar si la respuesta es válida
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          let responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        }).catch(() => {
          // Si falla la red y no está en caché, puedes manejar un respaldo si es necesario
        });
      })
  );
});
