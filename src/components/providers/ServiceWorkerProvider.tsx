"use client";

import { useEffect } from "react";

// Registers the hand-written worker in public/sw.js. Next 16's own PWA guide
// documents exactly this: manual registration from a client component, since
// there is no build-step convention for service workers in this version.
//
// Mounted inside the dashboard rather than the root layout — the marketing site
// gains nothing from an offline cache, and registering there would put a worker
// on the machine of every visitor who never signs in.
export function ServiceWorkerProvider() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Never in development, and actively tear down anything already installed.
    //
    // The worker's whole job is caching, and it is built for production's
    // content-hashed, immutable assets: cacheFirst (sw.js) deliberately never
    // revalidates /_next/static. In dev those URLs are NOT content-hashed and
    // Turbopack regenerates them on every edit, so the worker pins a dead chunk
    // forever, while networkFirst keeps serving an HTML document referencing
    // chunks that no longer exist. The page then breaks in the browser with the
    // dev server perfectly healthy and its log clean — which is a miserable
    // thing to debug, and cost exactly that after a large refactor.
    //
    // Nothing is lost: offline behaviour can only be exercised meaningfully
    // against a production build over HTTPS (`npm run build && npm start`).
    // The unregister + cache purge means an already-broken machine self-heals
    // on the next load rather than needing Application → Clear site data.
    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((registration) => registration.unregister());
      });
      if ("caches" in window) {
        caches.keys().then((keys) => {
          keys.filter((key) => key.startsWith("schoolos-")).forEach((key) => caches.delete(key));
        });
      }
      return;
    }

    // The ?v= build stamp is what versions the caches. A different script URL is
    // what makes the browser treat this as a new worker and run install/activate
    // again; the worker reads the same value back off its own location to name
    // its caches, so every deploy gets a clean set and the old ones are purged.
    // Without it the cache name was a hand-edited constant that nobody
    // remembered to bump, so shells from long-dead builds stayed live.
    //
    // A query string doesn't affect scope — the script is still at the root, so
    // scope "/" is unchanged. updateViaCache: "none" keeps the browser
    // revalidating sw.js itself rather than serving it from the HTTP cache.
    const version = process.env.NEXT_PUBLIC_BUILD_ID ?? "dev";

    navigator.serviceWorker
      .register(`/sw.js?v=${version}`, { scope: "/", updateViaCache: "none" })
      .catch(() => {
        // Registration fails on http:// origins other than localhost, and in
        // private modes. Offline support is then simply absent — nothing else in
        // the app depends on it, so there's nothing to report to the user.
      });
  }, []);

  return null;
}
