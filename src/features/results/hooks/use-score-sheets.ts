"use client";

import { useMemo } from "react";

import type { SchoolLevelValue } from "@/data/school-levels";
import type { GradeComponent } from "@/features/settings/api/grading-api";
import { useAcademicSessions } from "@/features/settings/hooks/use-academic-sessions";
import { useGradingSystems } from "@/features/settings/hooks/use-grading-systems";
import { useMyAssignments } from "@/features/teaching-assignments/hooks/use-my-assignments";
import { armDisplayName } from "@/lib/school/arm-display-name";

// One thing a teacher can enter scores for: a (class arm, subject) pair they
// hold an assignment on. That assignment is the authorisation too — the backend
// refuses score entry from anyone without it, with no admin override — so the
// picker is built from the same source that decides the answer, and can't offer
// a combination that would then 403.
export interface ScoreSheet {
  key: string;
  classArmId: string;
  armLabel: string;
  subjectId: string;
  subjectName: string;
  level: SchoolLevelValue;
}

export interface CurrentTerm {
  id: string;
  label: string;
}

export function useScoreSheets() {
  const { data: assignments, isPending: assignmentsLoading, isError, error } = useMyAssignments();
  const { data: sessions, isPending: sessionsLoading } = useAcademicSessions();
  const { data: gradingSystems, isPending: gradingLoading } = useGradingSystems();

  const sheets: ScoreSheet[] = useMemo(
    () =>
      (assignments ?? [])
        .map((a) => ({
          key: `${a.class_arm_id}:${a.subject.id}`,
          classArmId: a.class_arm_id,
          armLabel: armDisplayName({ name: a.arm_name }, a.class_name),
          subjectId: a.subject.id,
          subjectName: a.subject.name,
          level: a.subject.level as SchoolLevelValue,
        }))
        .sort((a, b) =>
          a.armLabel === b.armLabel
            ? a.subjectName.localeCompare(b.subjectName)
            : a.armLabel.localeCompare(b.armLabel),
        ),
    [assignments],
  );

  // Scores are always entered against the term that is current — there is no
  // picker for it. Back-dating a score into a closed term is a correction, which
  // belongs to the unlock workflow rather than to routine entry.
  // flatMap/find rather than a loop with an early return: React Compiler can't
  // preserve memoization across the latter. Same shape use-sync-school-data
  // already uses to locate the current period.
  const currentTerm: CurrentTerm | null = useMemo(() => {
    const match = (sessions ?? [])
      .flatMap((session) => session.periods.map((period) => ({ session, period })))
      .find((entry) => entry.period.is_current);
    return match
      ? { id: match.period.id, label: `${match.period.name} · ${match.session.name}` }
      : null;
  }, [sessions]);

  // Components are per level, and the level comes off the subject rather than
  // the class — they always agree (the backend refuses to offer a subject at a
  // level the arm isn't), and the subject is what this screen already holds.
  const componentsForLevel = useMemo(() => {
    const byLevel = new Map<string, GradeComponent[]>();
    (gradingSystems ?? []).forEach((system) => {
      byLevel.set(
        system.level,
        [...system.components].sort((a, b) => a.order - b.order),
      );
    });
    return byLevel;
  }, [gradingSystems]);

  return {
    sheets,
    currentTerm,
    componentsForLevel,
    isPending: assignmentsLoading || sessionsLoading || gradingLoading,
    isError,
    error,
  };
}
