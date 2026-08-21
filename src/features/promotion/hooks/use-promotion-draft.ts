"use client";

import { useMemo, useState } from "react";

import type { PromotionAssignment, PromotionPreviewItem } from "../types";

export interface PromotionDraftRow {
  item: PromotionPreviewItem;
  // Where this student is going. Seeded from the suggestion, null when the
  // backend couldn't map one confidently — which is a prompt, never a default.
  destinationArmId: string | null;
  selected: boolean;
  // Already sent in this sitting. See `committed` below for why this matters.
  isCommitted: boolean;
}

// Per-student destinations and selection for one (arm, source, target) combination.
//
// Re-seeds whenever any of the three changes, because a different combination is
// a different set of answers — carrying destinations across would quietly
// promote one arm's students on another arm's decisions.
export function usePromotionDraft(
  items: PromotionPreviewItem[] | undefined,
  seedKey: string | null,
) {
  const [destinations, setDestinations] = useState<Record<string, string | null>>({});
  const [deselected, setDeselected] = useState<Set<string>>(new Set());
  // Students already promoted during this sitting.
  //
  // The preview is scoped to *source*-session enrollment, so promoting a student
  // doesn't remove them from it — a re-preview returns them again, and sending
  // them a second time inserts a second target-session enrollment rather than
  // erroring. There is no way to detect this from the API: the preview's
  // student.current_class describes the current session, not the target, and
  // nothing lists a session's enrollments. So committed ids are tracked here
  // and those rows are locked.
  //
  // This is per-sitting only. A page reload loses it, and the same students
  // could then be promoted twice — flagged to the backend as a gap worth a
  // per-row "already enrolled in target session" flag.
  const [committed, setCommitted] = useState<Set<string>>(new Set());
  const [seededKey, setSeededKey] = useState<string | null>(null);

  // Seeded during render rather than in an effect, so the first paint after a
  // fetch already shows the suggestions rather than a frame of empty pickers.
  if (items && seedKey && seededKey !== seedKey) {
    const seed: Record<string, string | null> = {};
    items.forEach((item) => {
      seed[item.student.id] = item.suggested_class_arm_id;
    });
    setDestinations(seed);
    setDeselected(new Set());
    setCommitted(new Set());
    setSeededKey(seedKey);
  }

  const rows: PromotionDraftRow[] = useMemo(
    () =>
      (items ?? []).map((item) => {
        const isCommitted = committed.has(item.student.id);
        const destinationArmId = destinations[item.student.id] ?? null;
        return {
          item,
          destinationArmId,
          // A row with nowhere to go can't be sent, and a committed one must
          // not be sent again — so neither can be selected regardless of what
          // the admin ticked earlier.
          selected: !isCommitted && !!destinationArmId && !deselected.has(item.student.id),
          isCommitted,
        };
      }),
    [items, destinations, deselected, committed],
  );

  const assignments: PromotionAssignment[] = useMemo(
    () =>
      rows
        .filter((row) => row.selected && row.destinationArmId)
        .map((row) => ({ student_id: row.item.student.id, class_arm_id: row.destinationArmId! })),
    [rows],
  );

  function setDestination(studentId: string, armId: string | null) {
    setDestinations((prev) => ({ ...prev, [studentId]: armId }));
  }

  // Fills every row that isn't already committed. An arm usually moves
  // somewhere as a body, with a handful of exceptions, so this is the common
  // case and the per-row pickers are for the exceptions.
  function setAllDestinations(armId: string) {
    setDestinations((prev) => {
      const next = { ...prev };
      rows.forEach((row) => {
        if (!row.isCommitted) next[row.item.student.id] = armId;
      });
      return next;
    });
  }

  function toggle(studentId: string) {
    setDeselected((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  }

  function markCommitted(studentIds: string[]) {
    setCommitted((prev) => new Set([...prev, ...studentIds]));
  }

  return {
    rows,
    assignments,
    setDestination,
    setAllDestinations,
    toggle,
    markCommitted,
    // Rows the backend gave no destination for and nobody has filled in.
    unresolved: rows.filter((r) => !r.isCommitted && !r.destinationArmId).length,
    committedCount: committed.size,
  };
}
