// Simple offline-first service worker for app shell
const CACHE_NAME = 'unfold-collage-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-180.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k!==CACHE_NAME && caches.delete(k))))
  );
  self.clients.claim();
});

// Network falling back to cache for non-listed requests
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (ASSETS.some(a => url.pathname.endsWith(a.replace('./','/')))) {
    e.respondWith(caches.match(e.request));
    return;
  }
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(e.request, copy)).catch(()=>{});
      return res;
    }).catch(() => caches.match(e.request))
  );
});
