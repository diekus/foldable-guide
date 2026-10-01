/**
 * Service worker.
 * - Precaches the whole app shell: the Inspector has no remote data, so
 *   everything works offline.
 * - Navigations: network first (fresh HTML when online), then cache, then
 *   404.html for pages that were never cached.
 * - Other same-origin GET requests: cache first, then network.
 *
 * Bump VERSION whenever a precached file changes so clients get the update.
 */
const VERSION = 'v1';
const CACHE = `foldable-guide-${VERSION}`;

const PRECACHE = [
  './',
  './index.html',
  './404.html',
  './manifest.webmanifest',
  './css/tokens.css',
  './css/base.css',
  './css/foldable.css',
  './css/inspector.css',
  './js/app.js',
  './js/features.js',
  './js/foldable.js',
  './js/components/posture-readout.js',
  './js/components/segments-readout.js',
  './js/components/segment-map.js',
  './js/components/support-status.js',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/maskable-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key.startsWith('foldable-guide-') && key !== CACHE)
          .map((key) => caches.delete(key)),
      ))
      .then(() => self.clients.claim()),
  );
});

async function handleNavigation(request) {
  try {
    return await fetch(request);
  } catch {
    const cache = await caches.open(CACHE);
    return (await cache.match(request, { ignoreSearch: true }))
      ?? (await cache.match('./404.html'));
  }
}

async function handleAsset(request) {
  const cached = await caches.match(request);
  return cached ?? fetch(request);
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    request.mode === 'navigate' ? handleNavigation(request) : handleAsset(request),
  );
});
