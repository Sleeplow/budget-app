const CACHE = 'budget-v1';
const ASSETS = ['/', '/index.html', '/apple-touch-icon.png', '/manifest.json'];

// Installation : mise en cache des assets statiques
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activation : suppression des anciens caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch : network-first pour HTML, cache-first pour les autres assets
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);

  // Laisser passer toutes les requêtes externes (Firebase, Google, etc.)
  if (url.origin !== location.origin) return;

  if (e.request.destination === 'document') {
    // Network first pour le HTML
    e.respondWith(
      fetch(e.request)
        .then(r => {
          const clone = r.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return r;
        })
        .catch(() => caches.match(e.request))
    );
  } else {
    // Cache first pour icônes, manifest, etc.
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request))
    );
  }
});
