import type { Metadata } from "next";
import { CloudOff } from "lucide-react";

export const metadata: Metadata = { title: "Offline — SchoolOS" };

// The service worker falls back here when a route was never visited online and
// so was never cached. Deliberately static and dependency-free: it has to render
// with no network, no API and no cached data.
export default function OfflinePage() {
  return (
    <div className="grid min-h-dvh place-items-center px-6">
      <div className="max-w-md text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10">
          <CloudOff className="size-6 text-primary" />
        </div>

        <h1 className="mt-5 font-display text-2xl font-bold text-ink">You&rsquo;re offline</h1>
        {/* No longer claims the page was never opened — it often had been, and
            the cache simply hadn't matched. Says what's true either way. */}
        <p className="mt-2 text-sm leading-relaxed text-n-500">
          There&rsquo;s no saved copy of this page on your device, so it can&rsquo;t be
          shown until you&rsquo;re back on the network.
        </p>

        <div className="mt-6 rounded-xl border border-n-200 bg-white p-4 text-left">
          <p className="text-sm font-medium text-ink">Taking a register or entering scores?</p>
          <p className="mt-1 text-sm text-n-500">
            Attendance and score entry both work offline for classes you&rsquo;ve already
            opened. Marks and scores are saved on this device and sync as soon as
            you&rsquo;re back on the network.
          </p>
          {/* Plain anchors, deliberately. next/link does a client-side RSC
              fetch, which offline fails with nothing to fall back on — the tap
              simply did nothing. A real navigation is a document request the
              service worker can answer from cache. */}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            <a href="/attendance" className="text-sm font-medium text-primary hover:underline">
              Open attendance
            </a>
            <a href="/results" className="text-sm font-medium text-primary hover:underline">
              Open score entry
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
