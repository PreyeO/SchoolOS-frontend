"use client";

import { useSyncExternalStore } from "react";
import { onlineManager, useMutationState } from "@tanstack/react-query";

import { BULK_MARK_MUTATION_KEY } from "./use-bulk-mark";
import type { BulkMarkPayload, BulkMarkResponse, DraftEntry } from "../types";

export type SyncState = "idle" | "offline-queued" | "syncing";

export interface SyncStatus {
  state: SyncState;
  isOnline: boolean;
  // Registers saved but not yet accepted by the server.
  pendingCount: number;
  // The moment the teacher pressed Save on the oldest unsynced register — not
  // when it was queued for flush. Used to warn as it approaches the 7-day
  // refresh-token expiry, after which it can't be synced at all.
  oldestMarkedAt: string | null;
}

// Derived from TanStack's own mutation state rather than a parallel store: the
// queue *is* the set of paused/pending bulk-mark mutations, so a second source
// of truth could only ever disagree with it.
export function useSyncStatus(): SyncStatus {
  const isOnline = useOnlineStatus();

  const pending = useMutationState({
    filters: { mutationKey: BULK_MARK_MUTATION_KEY, status: "pending" },
    select: (mutation) => mutation.state.variables as BulkMarkPayload | undefined,
  });

  const markedAts = pending
    .map((payload) => payload?.records?.[0]?.marked_at)
    .filter((value): value is string => !!value)
    .sort();

  return {
    state: pending.length === 0 ? "idle" : isOnline ? "syncing" : "offline-queued",
    isOnline,
    pendingCount: pending.length,
    oldestMarkedAt: markedAts[0] ?? null,
  };
}

// The marks for one register that are sitting in the queue — handed over but
// not yet accepted. Keyed by student id, in the same shape as a draft entry so
// it can be compared against one directly.
export function usePendingMarks(
  classArmId: string | null,
  date: string,
): Record<string, DraftEntry> {
  const payloads = useMutationState({
    filters: { mutationKey: BULK_MARK_MUTATION_KEY, status: "pending" },
    select: (mutation) => mutation.state.variables as BulkMarkPayload | undefined,
  });

  // Not memoised: `payloads` is a fresh array every render, so any dependency
  // list built from it would invalidate anyway — and this is a linear pass over
  // a handful of queued batches.
  const marks: Record<string, DraftEntry> = {};
  if (!classArmId) return marks;

  payloads.forEach((payload) => {
    // Scoped to this exact register. A queued batch for another arm or another
    // day says nothing about whether *this* one has unsaved work.
    if (!payload || payload.class_arm_id !== classArmId || payload.date !== date) return;
    payload.records.forEach((record) => {
      marks[record.student_id] = { status: record.status, note: record.note ?? "" };
    });
  });
  return marks;
}

export interface SkippedReport {
  // Identifies this report so a dismissal sticks. submittedAt is stable for the
  // life of the mutation entry, unlike an array index.
  id: number;
  skipped: BulkMarkResponse["skipped"];
}

// The most recent save that had anything rejected. Read from the mutation cache
// rather than the page's own mutation instance, so a register that flushed in
// the background — while the teacher was on another screen, or before this page
// mounted — still gets reported when they arrive.
export function useLastSkippedReport(): SkippedReport | null {
  const reports = useMutationState({
    filters: { mutationKey: BULK_MARK_MUTATION_KEY, status: "success" },
    select: (mutation) => ({
      id: mutation.state.submittedAt,
      skipped: (mutation.state.data as BulkMarkResponse | undefined)?.skipped ?? [],
    }),
  });

  const withSkips = reports.filter((r) => r.skipped.length > 0);
  return withSkips.length > 0 ? withSkips[withSkips.length - 1] : null;
}

// onlineManager is what TanStack itself uses to decide whether to pause a
// mutation, so reading connectivity from it keeps the badge and the queue's
// actual behaviour in agreement — navigator.onLine alone can disagree with it.
//
// Subscribed via useSyncExternalStore rather than an effect: onlineManager is
// exactly the "external system" that primitive exists for, and it avoids the
// cascading render an effect-then-setState would cause on every mount.
export function useOnlineStatus(): boolean {
  return useSyncExternalStore(
    (listener) => onlineManager.subscribe(listener),
    () => onlineManager.isOnline(),
    // Server render: assume online, so nothing flashes an offline badge during
    // hydration.
    () => true,
  );
}
