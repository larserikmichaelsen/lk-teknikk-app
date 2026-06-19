// LK Teknikk - service worker
// Cacher app-skallet slik at appen starter raskt og fungerer offline.
// Nyheter og vaer hentes alltid live fra nett (caches ikke).
const CACHE = 'lk-teknikk-v5';
const SKALL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './favicon.svg',
  './favicon.ico',
  './favicon-16.png',
  './favicon-32.png',
  './favicon-48.png',
  './icon.svg',
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
  // Bare egne (same-origin) statiske filer haandteres her. API-kall gaar rett til nett.
  if (url.origin !== location.origin) return;
  // Network-first: hent alltid fersk app-skall naar vi er online, og oppdater cachen.
  // Faller tilbake paa cache (offline-oppstart) hvis nettet er nede.
  e.respondWith(
    fetch(e.request)
      .then(svar => {
        if (svar && svar.ok) {
          const kopi = svar.clone();
          caches.open(CACHE).then(c => c.put(e.request, kopi));
        }
        return svar;
      })
      .catch(() => caches.match(e.request))
  );
});
