"use client";

import { useEffect, useMemo, useState } from "react";

import type { StudentListItem } from "@/features/students/types";
import { useAuthStore } from "@/stores/auth-store";

import { readScoreDraft, scoreDraftKey, writeScoreDraft } from "../lib/score-draft-storage";
import type { Score } from "../types";
import type { ScoreSheetKeys } from "./use-score-draft";

// Keeps a score column in step with the server and with device storage.
//
// Split from useScoreDraft, which owns editing and the derived "what's still
// unsaved" logic. Both seed branches below run during render (React's "adjust
// state when data arrives") so the first paint after a fetch already shows what
// is saved. Their order is load-bearing: the new-column branch must be checked
// before the fresher-data one, or switching columns would merge the previous
// column's edits into the new one.
export function useScoreDraftSync(
  keys: ScoreSheetKeys,
  scores: Score[] | undefined,
  students: StudentListItem[] | undefined,
  // Bumped on every successful fetch, whether or not the rows changed — which is
  // exactly what "newer server data has landed" needs.
  scoresUpdatedAt: number,
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

  // Mirror after seeding only. Writing before the seed lands would persist an
  // empty draft over real stored edits during the render where the column
  // changes but its data hasn't arrived.
  useEffect(() => {
    if (!ready || seededKey !== key || !key) return;
    writeScoreDraft(membershipId, key, draft);
  }, [draft, key, membershipId, ready, seededKey]);

  return { draft, setDraft, ready, key, membershipId, savedForComponent };
}
