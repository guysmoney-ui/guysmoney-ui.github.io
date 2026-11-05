const C = 'jimmi-v41';
// Static shell only — never precache products.js / HTML / CSS / studio.js (those change often).
const PRECACHE = [
  'manifest.webmanifest',
  'icon-192.png',
  'assets/studio/logo-body.png',
  'assets/studio/logo-hair.png',
  'assets/studio/wordmark.png'
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(C).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== C).map((k) => caches.delete(k)));
    await self.clients.claim();
    const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clients) client.postMessage({ type: 'SW_UPDATED', version: C });
  })());
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || req.headers.has('range')) return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  const path = url.pathname;
  const isCatalog =
    path.endsWith('/products.js') ||
    path.endsWith('products.js') ||
    path.endsWith('/index.html') ||
    path.endsWith('/studio.html') ||
    path.endsWith('/studio.js') ||
    path.endsWith('/studio.css') ||
    path.endsWith('/styles.css') ||
    path.endsWith('/sw.js') ||
    path === '/' ||
    path.endsWith('/');
  // Catalog / app shell: network-only when possible (no stale put). Offline falls back to cache.
  if (isCatalog) {
    e.respondWith(
      fetch(req)
        .then((res) => res)
        .catch(() =>
          caches.match(req).then((m) => m || (req.mode === 'navigate' ? caches.match('index.html') : undefined))
        )
    );
    return;
  }
  // Other assets: network-first, update cache for offline.
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const cp = res.clone();
          caches.open(C).then((c) => c.put(req, cp));
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then((m) => m || (req.mode === 'navigate' ? caches.match('index.html') : undefined))
      )
  );
});
