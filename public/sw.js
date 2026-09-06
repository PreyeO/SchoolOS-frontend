/*
 * SchoolOS service worker.
 *
 * Hand-written on purpose. Turbopack is the default bundler for `next build` in
 * Next 16, and a custom webpack config makes the build fail — which rules out
 * Serwist and next-pwa, both of which require one. Files in public/ are served
 * byte-for-byte and are never compiled, so this has no build step and no
 * TypeScript. Keep it plain and dependency-free.
 *
 * Scope: PRECACHE_URLS below, kept deliberately narrow — see the comment
 * there for which routes qualify and why. The job is to get the app shell to
 * load with no network so a teacher can open a register or a score sheet.
 * API responses are deliberately NOT cached here — TanStack Query
 * persistence (lib/api/query-persistence.ts) owns that data, and a second
 * copy in the SW would be a competing source of truth that could serve a
 * stale roster behind the app's back.
 */

// Read off this worker's own URL, which ServiceWorkerProvider stamps with the
// build id (/sw.js?v=…). It used to be a hand-edited constant, which nobody ever
// bumped — so caches from builds long since replaced stayed live for months, and
// a single flaky fetch could serve a document referencing chunk hashes that no
// longer exist. Now every deploy is its own generation and activate clears the rest.
const VERSION = new URL(self.location.href).searchParams.get("v") || "dev";
const SHELL_CACHE = `schoolos-shell-${VERSION}`;
const ASSET_CACHE = `schoolos-assets-${VERSION}`;
const OFFLINE_URL = "/offline";

// Warmed at install rather than waiting for a visit. A teacher usually reaches
// the register (or score entry) by clicking the sidebar, which is a
// client-side navigation — the browser never requests the /attendance or
// /results document at all, so nothing would be cached to serve on a later
// cold start.
//
// Deliberately narrow, not "every route": each entry here needs its own
// offline-draft/paused-mutation handling to actually be usable once served
// from this cache, or a teacher just gets a page that loads but hangs on its
// data fetch instead of a clear "you're offline" message — worse than not
// precaching it at all. /results/behaviour has that (a local draft plus a
// paused-mutation queue, the same shape as score entry). The rest of Results
// (review, publish, broadsheet, remarks, leaderboard) are admin desk-tasks
// with no such handling, and Announcements has none either — neither belongs
// here.
const PRECACHE_URLS = [
  OFFLINE_URL,
  "/attendance",
  "/dashboard",
  "/my-classes",
  "/results",
  "/results/behaviour",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) =>
        // Individually, so one failure doesn't abandon the rest — addAll is
        // all-or-nothing, and a single redirect would cost us the whole shell.
        Promise.all(
          PRECACHE_URLS.map((url) =>
            fetch(url, { credentials: "same-origin" })
              .then((response) => (response.ok ? cache.put(url, response) : undefined))
              .catch(() => undefined),
          ),
        ),
      )
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
// never worth waiting for. No ignoreSearch here on purpose — for a static asset
// the query string is part of its identity.
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

// Fresh when we can reach the network, last-known-good when we can't, and the
// offline page as a final fallback for a route never visited.
async function networkFirst(request, { fallbackToOfflinePage }) {
  const cache = await caches.open(SHELL_CACHE);

  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone());
    return response;
  } catch (error) {
    // The Cache API honours the response's Vary header, and Next varies on RSC
    // — so a document request can't be answered with an RSC payload, or the
    // reverse, even though both live under the same URL.
    //
    // Exact match first. The comment this replaced claimed "the server returns
    // the same document for /attendance whatever ?arm= says" — that was wrong:
    // both /attendance and /fees read searchParams server-side and bake
    // ?arm=/?date= (or ?student=/?period=) into the props they render, so two
    // different query strings genuinely are two different documents once
    // fetched. Matching with ignoreSearch conflated them — after a teacher
    // opened several dates' registers while online, offline reselecting any
    // ALREADY-cached date still resolved to whichever entry ignoreSearch
    // happened to hit first (in practice, the precached bare /attendance,
    // baked with today's date) instead of that date's own correctly-cached
    // copy, snapping the picker back to today every time.
    let cached = await cache.match(request);

    // ignoreSearch stays as a last-resort fallback, not removed outright: a
    // device that has never opened this EXACT arm/date at all — the case the
    // old comment described, cold and offline from the start — still needs
    // something in-app to render rather than falling through to the generic
    // offline page below. This can still serve a different date/arm's content
    // in that narrow case; it's the same imprecision as before, just no
    // longer reached when an exact copy already exists.
    if (!cached) {
      cached = await cache.match(request, { ignoreSearch: true });
    }
    if (cached) return cached;

    if (fallbackToOfflinePage) {
      const offline = await cache.match(OFFLINE_URL);
      if (offline) return offline;
    }
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

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Everything else same-origin: full page loads (mode "navigate") and the RSC
  // payloads a client-side navigation fetches from the same URLs. Both need to
  // survive offline — handling only navigations left sidebar clicks broken while
  // the app was already open.
  //
  // Only a real navigation may fall back to the offline page; answering an RSC
  // fetch with an HTML document would break the router rather than inform it.
  event.respondWith(
    networkFirst(request, { fallbackToOfflinePage: request.mode === "navigate" }),
  );
});
