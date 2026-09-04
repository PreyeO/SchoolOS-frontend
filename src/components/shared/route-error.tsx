"use client";

import { CloudOff, RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";

interface Props {
  reset: () => void;
  // What this route is called in plain language — "Attendance", "Score entry" —
  // slotted into "Couldn't load {label}."
  label: string;
}

// A route-level error.tsx, not the root one (app/error.tsx) — that one replaces
// the ENTIRE page, sidebar included, for any crash anywhere in the app, with a
// placeholder that has carried a "TODO: design and implement" comment since it
// was written. This one wraps just this route segment, so the dashboard shell
// survives, and it's specifically for the offline case: reaching a page that
// crashes while there's no cached data for it to render — the class-of-bug this
// app already treats as a first-class state everywhere else data-fetching
// happens (see OfflineNotice), just not yet where the crash happens above that.
//
// navigator.onLine directly, not the app's useOnlineStatus/onlineManager hook:
// an error boundary's render is a one-shot snapshot of why THIS crash happened,
// not a live subscription — reading it once, synchronously, at the moment
// React asks what to show is exactly what's needed here, and it works whether
// or not this crash happened inside a component that talks to TanStack at all.
export function RouteError({ reset, label }: Props) {
  const offline = typeof navigator !== "undefined" && !navigator.onLine;

  if (offline) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-n-100">
          <CloudOff className="size-5 text-n-400" />
        </div>
        <h1 className="mt-4 font-display text-lg font-semibold text-ink">You&rsquo;re offline</h1>
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-n-500">
          {label} hasn&rsquo;t finished loading on this device before, so there&rsquo;s nothing
          saved here to open without a connection. Reconnect to load it for the first time —
          after that it keeps working offline.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <p className="text-sm text-n-500">Couldn&rsquo;t load {label}.</p>
      <Button type="button" variant="outline" size="sm" onClick={reset} className="mt-4">
        <RotateCw className="size-3.5 mr-1.5" />
        Try again
      </Button>
    </div>
  );
}
