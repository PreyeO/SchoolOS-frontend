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
// Seeded during render rather than in an effect (React's "adjust state when data
// arrives" pattern) so the first paint after a fetch already shows saved scores.
// The seed key is arm+subject+term+component: changing any of them re-seeds from
// scratch, because each names a different column of marks and carrying edits
// across would write one assessment's scores onto another's.
//
// Unsaved edits are mirrored to the device under that same key, so a half-filled
// column survives a reload, a discarded tab, or a walk to the next classroom.
export function useScoreDraft(
  keys: ScoreSheetKeys,
  scores: Score[] | undefined,
  students: StudentListItem[] | undefined,
) {
  const membershipId = useAuthStore((s) => s.claims?.membership_id ?? null);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [seededKey, setSeededKey] = useState<string | null>(null);

  const { classArmId, subjectId, academicPeriodId, gradeComponentId } = keys;
  const key =
    classArmId && subjectId && academicPeriodId && gradeComponentId
      ? scoreDraftKey(classArmId, subjectId, academicPeriodId, gradeComponentId)
      : null;
  const ready = !!key && !!scores && !!students;

  // Saved scores for the selected component only, by student.
  const savedForComponent = useMemo(() => {
    const map = new Map<string, Score>();
    (scores ?? []).forEach((s) => {
      if (s.grade_component === gradeComponentId) map.set(s.student.id, s);
    });
    return map;
  }, [scores, gradeComponentId]);

  const rosterIds = useMemo(() => new Set((students ?? []).map((s) => s.id)), [students]);

  if (ready && seededKey !== key) {
    const seed: Record<string, string> = {};
    savedForComponent.forEach((score, studentId) => {
      // A score can outlive a student's membership of the arm — Score snapshots
      // class_arm at entry time — so a transfer leaves their mark behind. Those
      // rows are history, not part of this column.
      if (!rosterIds.has(studentId)) return;
      // Trailing zeros off a DecimalField ("18.00") read as noise in a field the
      // teacher is about to retype, so normalise to the shortest form.
      seed[studentId] = String(Number(score.score_obtained));
    });

    // Stored edits go on top of the server's copy: they are the teacher's later
    // intent, made after this column was last loaded.
    const stored = readScoreDraft(membershipId, key);
    if (stored) {
      Object.entries(stored).forEach(([studentId, value]) => {
        if (rosterIds.has(studentId)) seed[studentId] = value;
      });
    }

    setDraft(seed);
    setSeededKey(key);
  }

  // Mirror after seeding only. Writing before the seed lands would persist an
  // empty draft over real stored edits during the render where the column
  // changes but its data hasn't arrived — silently wiping what's being restored.
  useEffect(() => {
    if (!ready || seededKey !== key || !key) return;
    writeScoreDraft(membershipId, key, draft);
  }, [draft, key, membershipId, ready, seededKey]);

  // Scores already handed to the queue but not yet accepted by the server. A
  // queued entry counts as committed — it's on its way, and resubmitting it
  // would only duplicate the work. If the batch later errors it leaves this set
  // and those scores correctly reappear as unsaved.
  const queued = usePendingScores(classArmId, subjectId, academicPeriodId, gradeComponentId);

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

  return { draft, savedForComponent, queued, setScore, clearAll, totals, draftKey: key };
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
