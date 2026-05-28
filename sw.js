/**
 * LinuxWiki — Service Worker
 * Cache-first para assets; network-first para páginas HTML
 */

importScripts('./data/modules/index.js', './scripts/catalog.js');

const CACHE_NAME = 'linuxwiki-v3';
const STATIC_CACHE = 'linuxwiki-static-v3';
const OFFLINE_404_URL = new URL('./404.html', self.location).href;

// Assets que queremos cachear imediatamente no install
const PRECACHE_URLS = self.LinuxWiki.Catalog.getPrecacheUrls();

// ── Install: pré-cacheia os assets estáticos ──
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate: limpa caches antigos ──
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME && name !== STATIC_CACHE)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// ── Fetch: estratégia por tipo de recurso ──
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requests não-GET e URLs externas (Google Fonts, etc)
  if (request.method !== 'GET') return;
  if (url.origin !== location.origin) return;

  // HTML: network-first (conteúdo atualizado), fallback para cache
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then(r => r || caches.match(OFFLINE_404_URL)))
    );
    return;
  }

  // CSS, JS, imagens: cache-first (assets raramente mudam)
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const clone = response.clone();
        caches.open(STATIC_CACHE).then(cache => cache.put(request, clone));
        return response;
      });
    })
  );
});
