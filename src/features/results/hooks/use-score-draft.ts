"use client";

import { useEffect, useMemo } from "react";

import type { StudentListItem } from "@/features/students/types";

import { clearScoreDraft } from "../lib/score-draft-storage";
import { useScoreDraftSync } from "./use-score-draft-sync";
import { usePendingScores } from "./use-score-sync";
import type { Score } from "../types";

export interface ScoreSheetKeys {
  classArmId: string | null | undefined;
  subjectId: string | null | undefined;
  academicPeriodId: string | null | undefined;
  gradeComponentId: string | null;
}

// The working state of one score column: saved scores as the baseline, plus
// whatever the teacher has typed since. Keyed by student id.
//
// Seeding, re-seeding when newer server data lands, and mirroring to device
// storage all live in useScoreDraftSync — see there for why those run during
// render. This hook owns editing, what counts as unsaved, and the running total.
export function useScoreDraft(
  keys: ScoreSheetKeys,
  scores: Score[] | undefined,
  students: StudentListItem[] | undefined,
  scoresUpdatedAt: number,
  // The active component's ceiling, so "unsaved" and "sendable" are decided once
  // here rather than recomputed against a different rule by the caller.
  componentMax: number,
) {
  const { draft, setDraft, ready, key, membershipId, savedForComponent } = useScoreDraftSync(
    keys,
    scores,
    students,
    scoresUpdatedAt,
  );
  const { classArmId, subjectId, academicPeriodId, gradeComponentId } = keys;

  // Scores handed to the queue but not yet accepted. A queued entry counts as
  // committed — it's on its way, and resubmitting would duplicate the work. If
  // the batch later errors it leaves this set and correctly reappears as unsaved.
  const queued = usePendingScores(classArmId, subjectId, academicPeriodId, gradeComponentId);

  // The single definition of "not yet with the server". Empty means cleared,
  // which this payload can't express, so it's never sendable; out-of-range
  // values are held in the draft but excluded here so a slip can't be submitted.
  const changed = useMemo(
    () =>
      Object.entries(draft).filter(([studentId, value]) => {
        const trimmed = value.trim();
        if (trimmed === "") return false;
        const parsed = Number(trimmed);
        if (Number.isNaN(parsed) || parsed < 0 || parsed > componentMax) return false;
        const inFlight = queued[studentId];
        if (inFlight !== undefined) return Number(inFlight) !== parsed;
        const existing = savedForComponent.get(studentId);
        if (!existing) return true;
        return Number(existing.score_obtained) !== parsed;
      }),
    [draft, queued, savedForComponent, componentMax],
  );

  // Once nothing differs from the server there is no unsaved work to protect, so
  // the stored copy is dropped. Without this the draft outlived its usefulness
  // and, being applied on top of every later seed, kept reinstating stale numbers
  // over fresher ones. Self-correcting: while a save is still queued offline the
  // server copy hasn't moved, `changed` stays non-empty, and the draft is kept.
  const isSynced = ready && changed.length === 0;
  useEffect(() => {
    if (isSynced && key) clearScoreDraft(membershipId, key);
  }, [isSynced, key, membershipId]);

  function setScore(studentId: string, value: string) {
    setDraft((prev) => ({ ...prev, [studentId]: value }));
  }

  function clearAll() {
    setDraft({});
  }

  // Every student's running total across all components of this subject, using
  // the draft for the column being edited so the figure moves as they type.
  const totals = useMemo(() => {
    const byStudent = new Map<string, number>();
    (scores ?? []).forEach((s) => {
      if (s.grade_component === gradeComponentId) return;
      byStudent.set(s.student.id, (byStudent.get(s.student.id) ?? 0) + Number(s.score_obtained));
    });
    Object.entries(draft).forEach(([studentId, value]) => {
      const parsed = Number(value);
      if (value.trim() === "" || Number.isNaN(parsed)) return;
      byStudent.set(studentId, (byStudent.get(studentId) ?? 0) + parsed);
    });
    return byStudent;
  }, [scores, gradeComponentId, draft]);

  return { draft, savedForComponent, queued, changed, setScore, clearAll, totals, draftKey: key };
}

// A typed value is only sendable if it's a number within the component's
// snapshotted maximum — the same bound the backend enforces, checked here so a
// slip is caught at the keystroke rather than as a 400 on the whole batch.
export function scoreError(value: string, max: number): string | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const parsed = Number(trimmed);
  if (Number.isNaN(parsed)) return "Numbers only";
  if (parsed < 0) return "Can't be negative";
  if (parsed > max) return `Max is ${max}`;
  return null;
}

export { clearScoreDraft };
