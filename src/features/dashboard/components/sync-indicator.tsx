"use client";

import Link from "next/link";
import { CloudOff, Loader2, WifiOff } from "lucide-react";

import { useSyncStatus } from "@/features/attendance/hooks/use-sync-status";

// Sits in the topbar so unsynced work is visible from any screen, not only the
// register that produced it. A teacher who marks a class then walks to the next
// one shouldn't have to go back to find out whether it saved.
export function SyncIndicator() {
  const { state, isOnline, pendingCount } = useSyncStatus();

  if (state === "syncing") {
    return (
      <span className="flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-foreground/70">
        <Loader2 className="size-3.5 animate-spin text-primary" />
        <span className="hidden sm:inline">Syncing…</span>
      </span>
    );
  }

  if (state === "offline-queued") {
    return (
      <Link
        href="/attendance"
        className="flex items-center gap-1.5 rounded-full border border-amber/40 bg-amber/10 px-2.5 py-1 text-xs font-medium text-ink transition-colors hover:bg-amber/20"
        title={`${pendingCount} register${pendingCount === 1 ? "" : "s"} saved offline, waiting to sync`}
      >
        <CloudOff className="size-3.5 text-amber" />
        {pendingCount}
        <span className="hidden sm:inline">waiting</span>
      </Link>
    );
  }

  // Nothing queued, but still worth saying — otherwise a teacher can't tell
  // whether the app is working offline by design or simply failing.
  if (!isOnline) {
    return (
      <span
        className="flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-2.5 py-1 text-xs font-medium text-foreground/70"
        title="You're offline. Attendance still works and will sync later."
      >
        <WifiOff className="size-3.5 text-muted-foreground" />
        <span className="hidden sm:inline">Offline</span>
      </span>
    );
  }

  return null;
}
