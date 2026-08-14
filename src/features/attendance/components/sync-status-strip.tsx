"use client";

import { CloudOff, Loader2, TriangleAlert } from "lucide-react";

import { useNow } from "@/lib/hooks/use-now";
import { formatTimestamp } from "@/lib/text/format-timestamp";

import { useSyncStatus } from "../hooks/use-sync-status";

// Refresh tokens last 7 days, so a register older than that can no longer be
// synced at all. Warn with a day in hand rather than at the cliff edge.
const AT_RISK_MS = 6 * 24 * 60 * 60 * 1000;

export function SyncStatusStrip() {
  const { state, pendingCount, oldestMarkedAt } = useSyncStatus();
  const now = useNow();

  if (state === "idle") return null;

  const registers = `${pendingCount} register${pendingCount === 1 ? "" : "s"}`;

  if (state === "syncing") {
    return (
      <p className="flex items-center gap-2 rounded-lg border border-n-200 bg-n-50 px-3.5 py-2.5 text-xs text-n-600">
        <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
        Syncing {registers}…
      </p>
    );
  }

  const atRisk = !!oldestMarkedAt && now - new Date(oldestMarkedAt).getTime() > AT_RISK_MS;

  return (
    <div className="rounded-lg border border-amber/40 bg-amber/10 px-3.5 py-2.5">
      <p className="flex items-center gap-2 text-xs text-ink">
        <CloudOff className="size-4 shrink-0 text-amber" />
        <span>
          <span className="font-medium">Saved offline</span> — {registers} will sync when
          you&rsquo;re back online. You can keep marking.
        </span>
      </p>

      {/* Not cosmetic: past the refresh-token window the queue can't be sent at
          all, and the teacher would have no way to know their work was stranded. */}
      {atRisk && oldestMarkedAt && (
        <p className="mt-1.5 flex items-center gap-2 text-xs text-clay">
          <TriangleAlert className="size-3.5 shrink-0" />
          The oldest is from {formatTimestamp(oldestMarkedAt)}. Connect within a day or it
          may not be able to sync.
        </p>
      )}
    </div>
  );
}
