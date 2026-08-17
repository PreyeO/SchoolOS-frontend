"use client";

import { useEffect, useMemo, useState } from "react";

import type { StudentListItem } from "@/features/students/types";
import { useAuthStore } from "@/stores/auth-store";

import {
  clearScoreDraft,
  readScoreDraft,
  writeScoreDraft,
  scoreDraftKey,
} from "../lib/score-draft-storage";
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
// Seeded during render (React's "adjust state when data arrives" pattern) so the
// first paint after a fetch already shows saved scores. The seed key is
// arm+subject+term+component: changing any of them re-seeds from scratch,
// because each names a different column of marks.
//
// It also re-seeds *within* a column when newer server data lands, which the
// first version did not — it seeded once per key and never again. The tab counts
// read `scores` directly so they updated, while the input boxes kept showing the
// state from first load. Entering marks for the same column in two browsers made
// that plain: the second browser's counts moved, its boxes didn't.
export function useScoreDraft(
  keys: ScoreSheetKeys,
  scores: Score[] | undefined,
  students: StudentListItem[] | undefined,
  // Bumped on every successful fetch, whether or not the rows changed — which is
  // exactly what "newer server data has landed" needs.
  scoresUpdatedAt: number,
  // The active component's ceiling, so "unsaved" and "sendable" are decided once
  // here rather than recomputed against a different rule by the caller.
  componentMax: number,
) {
  const membershipId = useAuthStore((s) => s.claims?.membership_id ?? null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [seededKey, setSeededKey] = useState<string | null>(null);
  const [seededAt, setSeededAt] = useState(0);
  // The exact values the last seed produced. Comparing against this is what
  // separates a genuine local edit from a value that merely predates a refetch —
  // without it a re-seed either discards the teacher's typing or preserves stale
  // numbers forever.
  const [seededValues, setSeededValues] = useState<Record<string, string>>({});

  const { classArmId, subjectId, academicPeriodId, gradeComponentId } = keys;
  const key =
    classArmId && subjectId && academicPeriodId && gradeComponentId
      ? scoreDraftKey(classArmId, subjectId, academicPeriodId, gradeComponentId)
      : null;
  const ready = !!key && !!scores && !!students;

  const savedForComponent = useMemo(() => {
    const map = new Map<string, Score>();
    (scores ?? []).forEach((s) => {
      if (s.grade_component === gradeComponentId) map.set(s.student.id, s);
    });
    return map;
  }, [scores, gradeComponentId]);

  const rosterIds = useMemo(() => new Set((students ?? []).map((s) => s.id)), [students]);

  // What the server currently holds for this column, as input strings.
  const serverValues = useMemo(() => {
    const base: Record<string, string> = {};
    savedForComponent.forEach((score, studentId) => {
      // A score can outlive a student's membership of the arm — Score snapshots
      // class_arm at entry time — so a transfer leaves their mark behind. Those
      // rows are history, not part of this column.
      if (!rosterIds.has(studentId)) return;
      // Trailing zeros off a DecimalField ("18.00") read as noise in a field the
      // teacher is about to retype, so normalise to the shortest form.
      base[studentId] = String(Number(score.score_obtained));
    });
    return base;
  }, [savedForComponent, rosterIds]);

  if (ready && seededKey !== key) {
    // New column. Stored edits go on top of the server's copy — they're the
    // teacher's later intent, made after this column was last loaded.
    const stored = readScoreDraft(membershipId, key);
    const seed = { ...serverValues };
    if (stored) {
      Object.entries(stored).forEach(([studentId, value]) => {
        if (rosterIds.has(studentId)) seed[studentId] = value;
      });
    }
    setDraft(seed);
    setSeededValues(serverValues);
    setSeededKey(key);
    setSeededAt(scoresUpdatedAt);
  } else if (ready && seededKey === key && scoresUpdatedAt > seededAt) {
    // Same column, fresher data. Take the server's values wholesale, then put
    // back only the cells this teacher has actually changed since the last seed.
    // A colleague's entry on another device therefore appears, while typing in
    // progress here is never overwritten by it.
    const merged = { ...serverValues };
    Object.entries(draft).forEach(([studentId, value]) => {
      if (value !== (seededValues[studentId] ?? "")) merged[studentId] = value;
    });
    setDraft(merged);
    setSeededValues(serverValues);
    setSeededAt(scoresUpdatedAt);
  }

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

  useEffect(() => {
    if (!ready || seededKey !== key || !key) return;
    writeScoreDraft(membershipId, key, draft);
  }, [draft, key, membershipId, ready, seededKey]);

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
