// Service Worker — always fetch fresh from network
const CACHE_NAME = 'mek-finance-v3';

self.addEventListener('install', e => {
  self.skipWaiting(); // activate immediately
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k))) // clear all old caches
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Always go to network first, fallback to cache
  e.respondWith(
    fetch(e.request).then(res => {
      // Store fresh copy in cache
      const copy = res.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(e.request, copy));
      return res;
    }).catch(() => {
      // Offline fallback — use cache
      return caches.match(e.request);
    })
  );
});
