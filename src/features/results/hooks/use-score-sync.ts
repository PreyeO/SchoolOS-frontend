"use client";

import { useMutationState } from "@tanstack/react-query";

import { SCORE_ENTRY_MUTATION_KEY } from "./use-enter-scores";
import type { BulkScoreEntryPayload, BulkScoreEntryResponse } from "../types";

// Derived from TanStack's own mutation state rather than a parallel store: the
// queue *is* the set of paused/pending score batches, so a second source of
// truth could only ever disagree with it.

// Entries already handed to the queue but not yet accepted, for one column.
// Without this, an offline save never "takes": the server copy can't change with
// no network, so every queued score stays in `changed` and the sheet insists it
// has unsaved work no matter how often it's saved.
export function usePendingScores(
  classArmId: string | null | undefined,
  subjectId: string | null | undefined,
  academicPeriodId: string | null | undefined,
  gradeComponentId: string | null,
): Record<string, string> {
  const payloads = useMutationState({
    filters: { mutationKey: SCORE_ENTRY_MUTATION_KEY, status: "pending" },
    select: (mutation) => mutation.state.variables as BulkScoreEntryPayload | undefined,
  });

  // Not memoised: `payloads` is a fresh array every render, so any dependency
  // list built from it would invalidate anyway, and this is a linear pass over a
  // handful of queued batches.
  const queued: Record<string, string> = {};
  if (!classArmId || !subjectId || !academicPeriodId || !gradeComponentId) return queued;

  payloads.forEach((payload) => {
    // Scoped to this exact column. A queued batch for another subject or
    // component says nothing about whether *this* one has unsaved work.
    if (
      !payload ||
      payload.class_arm_id !== classArmId ||
      payload.subject_id !== subjectId ||
      payload.academic_period_id !== academicPeriodId
    ) {
      return;
    }
    payload.entries.forEach((entry) => {
      if (entry.grade_component_id !== gradeComponentId) return;
      queued[entry.student_id] = String(entry.score);
    });
  });
  return queued;
}

export interface ScoreQueueStatus {
  pendingCount: number;
  // The moment the teacher pressed Save on the oldest unsynced batch — not when
  // it was queued for flush. Used to warn as it nears the 7-day refresh-token
  // expiry, after which it can't be synced at all.
  oldestMarkedAt: string | null;
}

export function useScoreQueue(): ScoreQueueStatus {
  const pending = useMutationState({
    filters: { mutationKey: SCORE_ENTRY_MUTATION_KEY, status: "pending" },
    select: (mutation) => mutation.state.variables as BulkScoreEntryPayload | undefined,
  });

  const markedAts = pending
    .map((payload) => payload?.entries?.[0]?.marked_at)
    .filter((value): value is string => !!value)
    .sort();

  return { pendingCount: pending.length, oldestMarkedAt: markedAts[0] ?? null };
}

export interface ScoreRejection {
  id: number;
  message: string;
  entryCount: number;
}

// The most recent batch the server refused outright — which for scores is a real
// possibility rather than an edge case: the whole batch is rejected if the
// subject was approved between entry and sync.
//
// Read from the mutation cache rather than the page's own mutation instance, so
// a batch that failed in the background — while the teacher was on another
// screen, or before this page mounted — is still reported when they arrive. A
// toast alone would have vanished.
export function useLastScoreRejection(): ScoreRejection | null {
  const failures = useMutationState({
    filters: { mutationKey: SCORE_ENTRY_MUTATION_KEY, status: "error" },
    select: (mutation) => ({
      id: mutation.state.submittedAt,
      message: (mutation.state.error as Error | null)?.message ?? "",
      entryCount: (mutation.state.variables as BulkScoreEntryPayload | undefined)?.entries.length ?? 0,
    }),
  });

  return failures.length > 0 ? failures[failures.length - 1] : null;
}

export type { BulkScoreEntryResponse };
