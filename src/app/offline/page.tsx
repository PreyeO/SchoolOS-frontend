import type { Metadata } from "next";
import Link from "next/link";
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
        <p className="mt-2 text-sm leading-relaxed text-n-500">
          This page hasn&rsquo;t been opened on this device before, so there&rsquo;s no saved
          copy to show. Pages you&rsquo;ve already visited still work.
        </p>

        <div className="mt-6 rounded-xl border border-n-200 bg-white p-4 text-left">
          <p className="text-sm font-medium text-ink">Taking a register?</p>
          <p className="mt-1 text-sm text-n-500">
            If you&rsquo;ve opened it before while online, it still works — marks are saved
            on this device and sync when you&rsquo;re back on the network.
          </p>
          <Link
            href="/attendance"
            className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
          >
            Open attendance
          </Link>
        </div>
      </div>
    </div>
  );
}
