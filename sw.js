// Bump this whenever you change any page, icon or image. The old cache is
// cleared on activate, so users pick up the new build on next launch.
const CACHE = 'temple-v1';

// Precached up front: the shell, every section, icons, and the phone-sized
// mirror art. Together these are what "works offline" actually means.
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './portal.html',
  './astrolabe.html',
  './altar.html',
  './mirror.html',
  './divination.html',
  './potion-game.html',
  './kid-zone.html',
  './mirror-bg-800.webp',
  './mirror-bg-800.jpg',
  './icon-48.png',
  './icon-72.png',
  './icon-96.png',
  './icon-144.png',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-192.png',
  './icon-maskable-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      // addAll fails the whole install if any single file 404s, so add them
      // individually - one bad path shouldn't leave the app uncached.
      .then(c => Promise.all(SHELL.map(u => c.add(u).catch(err =>
        console.warn('[sw] skipped', u, err)))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Live services: never cached, never required for the app to open.
  // The offline bar tells the user why these fail.
  if (url.hostname.endsWith('open-meteo.com') ||
      url.hostname.endsWith('script.google.com') ||
      url.hostname.endsWith('script.googleusercontent.com')) {
    e.respondWith(fetch(req).catch(() => Response.error()));
    return;
  }

  // Everything else: serve from cache, refresh in the background.
  e.respondWith(
    caches.match(req).then(cached => {
      const net = fetch(req).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || net;
    })
  );
});
