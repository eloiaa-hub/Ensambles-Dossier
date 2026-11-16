/* Ensambles de carpintería · funcionamiento sin conexión.
   Al instalar guarda lo imprescindible para la versión del alumnado; el resto (apuntes, PDF, versión del profesor)
   se guarda la primera vez que se abre. Siempre responde con lo guardado, si lo hay, y lo actualiza por detrás:
   los cambios que subas a GitHub se ven la siguiente vez que se abra con conexión. */
var VERSION = 'ensambles-v1';
var BASICOS = [
  './', 'index.html', 'ensambles_3d_alumno.html', 'modelos/herramientas_glb.js', 'manifest.webmanifest',
  'img/icono-192.png', 'img/icono-512.png', 'img/icono-180.png', 'img/favicon.png'
];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(BASICOS); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(VERSION).then(function (c) {
    return c.match(req, { ignoreSearch: true }).then(function (guardado) {
      var red = fetch(req).then(function (r) { if (r && r.ok && r.type === 'basic') c.put(req, r.clone()); return r; })
        .catch(function () { return guardado || (req.mode === 'navigate' ? c.match('ensambles_3d_alumno.html') : undefined); });
      if (guardado) { e.waitUntil(red.catch(function () {})); return guardado; }
      return red;
    });
  }));
});
