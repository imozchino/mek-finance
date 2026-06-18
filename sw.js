const CACHE_NAME = 'mek-finance-v6';

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  
  // Don't intercept external API calls - let them go directly
  if (url.includes('corsproxy.io') || 
      url.includes('yahoo.com') || 
      url.includes('supabase.co') ||
      url.includes('allorigins') ||
      url.includes('workers.dev')) {
    return; // pass through without caching
  }

  // Never try to cache non-GET requests (POST/PUT/DELETE) - Cache API doesn't support them
  if (e.request.method !== 'GET') {
    return;
  }

  // For app files: network first, fallback to cache
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then(cache => cache.put(e.request, copy));
      return res;
    }).catch(() => caches.match(e.request))
  );
});
