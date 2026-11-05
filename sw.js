// Solitaire Chess service worker — offline shell + precached PGN collections.
// Scope: site root. Precache list comes from collections/collections.json, so
// adding a game = adding one entry to that file (plus a deploy). Encrypted
// collections (.pgn.enc, listed under "encrypted") are precached too — the
// ciphertext is safe to cache; decryption stays in the browser.
const VERSION = 'v2';
const CACHE = 'solchess-' + VERSION;
const SHELL = ['solchess.html'];
const JSON_URL = 'collections/collections.json';

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(SHELL);
    // Read the collection list and precache every .pgn file.
    // allSettled so a single missing file can never fail the install.
    let names = [];
    let encNames = [];
    try {
      const res = await fetch(JSON_URL, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const arr = Array.isArray(data) ? data : data.collections;
        if (Array.isArray(arr)) names = arr.filter((n) => typeof n === 'string');
        if (!Array.isArray(data) && Array.isArray(data.encrypted)) {
          encNames = data.encrypted.filter((n) => typeof n === 'string');
        }
      }
    } catch (e) { /* json unreachable — it is precached directly below */ }
    const base = JSON_URL.slice(0, JSON_URL.lastIndexOf('/') + 1);
    const urls = [
      JSON_URL,
      ...names.map((n) => base + encodeURIComponent(n) + '.pgn'),
      ...encNames.map((n) => base + encodeURIComponent(n) + '.pgn.enc'),
    ];
    await Promise.allSettled(urls.map((u) => cache.add(u)));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const path = new URL(req.url).pathname;
  const isShell = path.endsWith('/solchess.html');
  const isData = /\/[^/]*\.pgn(\.enc)?$/i.test(path) || /\/collections\.json$/i.test(path);
  if (!isShell && !isData) return;

  if (isShell) {
    // Network-first: redeploys of solchess.html always update; offline falls
    // back to the last cached shell.
    event.respondWith((async () => {
      try {
        const fresh = await fetch(req);
        if (fresh && fresh.ok) {
          const cache = await caches.open(CACHE);
          cache.put(req, fresh.clone());
        }
        return fresh;
      } catch (e) {
        return await caches.match(req) || Response.error();
      }
    })());
    return;
  }

  // Data (.pgn / collections.json): cache-first with background revalidation.
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req);
    const network = fetch(req).then(
      (res) => {
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      },
      () => null,
    );
    if (cached) {
      event.waitUntil(network.then(() => {}));
      return cached;
    }
    return await network || Response.error();
  })());
});
