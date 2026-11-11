// Solitaire Chess service worker — offline shell + self-updating PGN cache.
// Scope: site root. The collection list (collections.json) is NETWORK-FIRST:
// online it re-checks the manifest on every fetch and syncs the cache (new
// collections get precached, removed ones evicted) — no VERSION bump needed
// for content changes. The .pgn/.pgn.enc bodies are CACHE-FIRST with
// background revalidation: instant + offline-proof, quietly refreshed.
// Encrypted collections (.pgn.enc) are precached too — the ciphertext is
// safe to cache; decryption stays in the browser. Bump VERSION only when the
// worker's own logic changes.
// v5: manifest offline-fallback responses are tagged 'x-solchess-cache' so
// the page's sync toast can tell a fresh sync from a cached one.
const VERSION = 'v5';
const CACHE = 'solchess-' + VERSION;
const SHELL = ['solchess.html'];
const JSON_URL = 'collections/collections.json';
const BASE = JSON_URL.slice(0, JSON_URL.lastIndexOf('/') + 1);

// Manifest shape: ["Name", ...] or {collections:[...], encrypted:[...]}.
function manifestOf(data) {
  const arr = Array.isArray(data) ? data : (data && data.collections);
  const plain = Array.isArray(arr) ? arr.filter((n) => typeof n === 'string') : [];
  const enc = (!Array.isArray(data) && data && Array.isArray(data.encrypted))
    ? data.encrypted.filter((n) => typeof n === 'string') : [];
  return { plain, enc };
}

function pgnUrls(manifest) {
  return [
    ...manifest.plain.map((n) => BASE + encodeURIComponent(n) + '.pgn'),
    ...manifest.enc.map((n) => BASE + encodeURIComponent(n) + '.pgn.enc'),
  ];
}

// Fetch + parse the fresh manifest; null when unreachable/broken.
async function fetchManifest() {
  try {
    const res = await fetch(JSON_URL, { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) { return null; }
}

// allSettled so a single missing file can never fail the whole precache.
async function precacheAll(cache, manifest) {
  const urls = [JSON_URL, ...pgnUrls(manifest)];
  await Promise.allSettled(urls.map((u) => cache.add(u)));
}

// Diff two manifests: precache additions, evict removals (pgn + pgn.enc).
async function syncCollections(cache, oldData, newData) {
  const oldM = manifestOf(oldData), newM = manifestOf(newData);
  const oldNames = new Set([...oldM.plain, ...oldM.enc]);
  const newNames = new Set([...newM.plain, ...newM.enc]);
  const added = pgnUrls({
    plain: newM.plain.filter((n) => !oldNames.has(n)),
    enc: newM.enc.filter((n) => !oldNames.has(n)),
  });
  const removed = [...oldNames].filter((n) => !newNames.has(n));
  await Promise.allSettled(added.map((u) => cache.add(u)));
  await Promise.allSettled(removed.flatMap((n) => [
    cache.delete(BASE + encodeURIComponent(n) + '.pgn'),
    cache.delete(BASE + encodeURIComponent(n) + '.pgn.enc'),
  ]));
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(SHELL);
    const data = await fetchManifest();
    await precacheAll(cache, data ? manifestOf(data) : { plain: [], enc: [] });
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

// Tag cache-served responses so the page can tell an offline fallback from a
// fresh network sync (used by the sync toast on the collections manifest).
function withCacheTag(res) {
  const out = new Response(res.body, { status: res.status, statusText: res.statusText, headers: res.headers });
  out.headers.set('x-solchess-cache', '1');
  return out;
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const path = new URL(req.url).pathname;
  const isShell = path.endsWith('/solchess.html');
  const isManifest = /\/collections\.json$/i.test(path);
  const isPgn = /\/[^/]*\.pgn(\.enc)?$/i.test(path);
  if (!isShell && !isManifest && !isPgn) return;

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

  if (isManifest) {
    // Network-first + cache sync: online, the manifest is always fresh and
    // the cache self-heals (precache additions, evict removals); offline the
    // cached manifest keeps the picker fully usable.
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const cached = await cache.match(req);
      try {
        const fresh = await fetch(req, { cache: 'no-store' });
        if (!fresh || !fresh.ok) return cached ? withCacheTag(cached) : fresh;
        const freshClone = fresh.clone();
        const newData = await freshClone.json().catch(() => null);
        if (newData) {
          const oldData = cached ? await cached.clone().json().catch(() => null) : null;
          cache.put(req, fresh.clone());
          if (oldData) event.waitUntil(syncCollections(cache, oldData, newData));
        }
        return fresh;
      } catch (e) {
        return cached ? withCacheTag(cached) : Response.error();
      }
    })());
    return;
  }

  // .pgn / .pgn.enc: cache-first with background revalidation.
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
