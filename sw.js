// LK Teknikk - service worker
// Cacher app-skallet slik at appen starter raskt og fungerer offline.
// Nyheter og vaer hentes alltid live fra nett (caches ikke).
const CACHE = 'lk-teknikk-v1';
const SKALL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png',
  './icon-180.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SKALL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(navn => Promise.all(navn.filter(n => n !== CACHE).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // Bare egne (same-origin) statiske filer caches. API-kall gaar rett til nett.
  if (url.origin === location.origin) {
    e.respondWith(
      caches.match(e.request).then(treff => treff || fetch(e.request))
    );
  }
});
