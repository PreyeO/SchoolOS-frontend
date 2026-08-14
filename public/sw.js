/*
 * SchoolOS service worker.
 *
 * Hand-written on purpose. Turbopack is the default bundler for `next build` in
 * Next 16, and a custom webpack config makes the build fail — which rules out
 * Serwist and next-pwa, both of which require one. Files in public/ are served
 * byte-for-byte and are never compiled, so this has no build step and no
 * TypeScript. Keep it plain ES5-ish and dependency-free.
 *
 * Scope: attendance only. The job is to get the app shell to load with no
 * network so a teacher can open a register they have already visited. API
 * responses are deliberately NOT cached here — TanStack Query persistence owns
 * that data, and a second copy in the SW would be a competing source of truth
 * that could serve a stale roster behind the app's back.
 */

const VERSION = "v1";
const SHELL_CACHE = `schoolos-shell-${VERSION}`;
const ASSET_CACHE = `schoolos-assets-${VERSION}`;
const OFFLINE_URL = "/offline";

// The one route that must survive a cold offline start. Warmed on install so a
// teacher who installs the app and loses signal still gets something useful.
const PRECACHE_URLS = [OFFLINE_URL];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      // A failed precache must not block activation — the runtime caching below
      // still works, and a broken install would leave no worker at all.
      .catch(() => undefined)
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("schoolos-") && !key.endsWith(VERSION))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/fonts/") ||
    url.pathname.startsWith("/images/") ||
    /\.(?:svg|png|jpg|jpeg|webp|woff2?|ico)$/.test(url.pathname)
  );
}

// Content-hashed and immutable, so a hit is always correct and the network is
// never worth waiting for.
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response && response.ok) {
    const cache = await caches.open(ASSET_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

// Fresh when we can reach the network, last-known-good when we can't, and a
// plain offline page when we've never seen the route at all.
async function networkFirst(request) {
  const cache = await caches.open(SHELL_CACHE);

  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;

    const offline = await cache.match(OFFLINE_URL);
    if (offline) return offline;
    throw error;
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only GETs are cacheable, and a queued POST must reach the network on its own
  // terms — TanStack pauses and replays those, not the service worker.
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // The API is TanStack's territory. Caching it here would let the SW answer
  // with a roster the app's own cache has already superseded.
  if (url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
  }
});
