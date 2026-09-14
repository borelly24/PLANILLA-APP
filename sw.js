const CACHE_NAME = 'planilla-app-v1';
const urlsToCache = [
  './',
  './index.html',     // Recuerda cambiar 'index.html' por el nombre exacto de tu archivo principal si es distinto
  './manifest.json',
  './css/all.min.css'
];

// Instalación del Service Worker y almacenamiento en caché de los archivos vitales
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Archivos en caché guardados con éxito');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.error('Error al guardar en caché los archivos:', err))
  );
  self.skipWaiting();
});

// Activación y limpieza de cachés antiguas si actualizas la versión
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

// Interceptación de solicitudes para servir el contenido offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Devuelve el archivo desde la caché si existe, sino realiza la petición a la red
        return response || fetch(event.request);
      })
      .catch(() => {
        // Opcional: Podrías mostrar una página de respaldo si no hay red ni caché
      })
  );
});
