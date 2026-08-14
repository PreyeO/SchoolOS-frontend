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

    // updateViaCache: "none" so the browser always revalidates sw.js itself;
    // otherwise a cached worker can pin an old cache version indefinitely.
    navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }).catch(() => {
      // Registration fails on http:// origins other than localhost, and in
      // private modes. Offline support is then simply absent — nothing else in
      // the app depends on it, so there's nothing to report to the user.
    });
  }, []);

  return null;
}
