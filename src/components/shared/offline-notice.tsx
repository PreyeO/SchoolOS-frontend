"use client";

import Link from "next/link";
import { CloudOff } from "lucide-react";

// Shown when a screen has no cached copy and there's no network to fetch one.
//
// This is a distinct state from "loading" and from "failed", and conflating them
// is what made the app feel broken offline. With networkMode "online" TanStack
// *pauses* an offline query rather than failing it, so a query with no persisted
// data sits at status "pending" indefinitely — every screen that keyed its
// spinner off isPending span forever, saying "Loading…" about something that
// could never arrive.
//
// Attendance is deliberately named as the way out: it's the one thing that does
// work offline, and a teacher who reached here was probably heading there.
export function OfflineNotice({ resourceLabel }: { resourceLabel: string }) {
  return (
    <div className="rounded-xl border border-n-200 bg-n-50 p-5">
      <div className="flex items-start gap-3">
        <CloudOff className="mt-0.5 size-5 shrink-0 text-n-400" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">You&rsquo;re offline</p>
          <p className="mt-1 text-sm text-n-500">
            {resourceLabel} hasn&rsquo;t been saved to this device, so there&rsquo;s nothing
            to show until you&rsquo;re back on the network. It will load by itself once
            you reconnect.
          </p>
          <Link
            href="/attendance"
            className="mt-2.5 inline-block text-sm font-medium text-primary hover:underline"
          >
            Take a register instead
          </Link>
        </div>
      </div>
    </div>
  );
}
