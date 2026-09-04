"use client";

import { useMemo } from "react";

import { SCHOOL_LEVELS, type SchoolLevelValue } from "@/data/school-levels";
import { useArmSubjects } from "@/features/teaching-assignments/hooks/use-arm-subjects";
import { useSubjects } from "@/features/settings/hooks/use-subjects";

export interface ReviewQueueSubjectOption {
  id: string;
  name: string;
  // Set only when this name collides with another subject's in the current
  // option list — see the comment below for why that happens.
  disambiguator?: string;
}

const LEVEL_LABEL: Record<SchoolLevelValue, string> = Object.fromEntries(
  SCHOOL_LEVELS.map((l) => [l.value, l.label]),
) as Record<SchoolLevelValue, string>;

// The Subject filter's own options — deliberately NOT derived from the
// submissions the queue happens to have loaded (see use-review-queue.ts:
// paging server-side means there's no full-term list to derive them from
// any more). Two separate, already-cheap sources instead:
//
//   - No class picked: every ACTIVE subject the school has, school-wide —
//     the same "pick anything, an empty result is a valid answer" contract
//     the Class filter itself already has (its options come from useClasses,
//     not from submissions either).
//   - A class picked: that class arm's OWN subjects specifically
//     (GET /class-arms/{id}/subjects/ — already used by Teaching
//     Assignments, needs no permission beyond school membership), which is
//     more precise than the school-wide list filtered to the arm's level
//     would be — an arm doesn't necessarily offer every subject its level
//     defines.
//
// Subject is unique per (school, name, level) only while ACTIVE
// (academic/models.py), so two different, both-active subjects can still
// render identically if they belong to different levels — a
// disambiguator (the level's label) is appended only when that's actually
// happening in the current list, not unconditionally.
export function useReviewQueueSubjects(armId: string): {
  subjects: ReviewQueueSubjectOption[];
  isPending: boolean;
} {
  const schoolWide = useSubjects();
  const armScoped = useArmSubjects(armId || null);

  return useMemo(() => {
    if (armId) {
      const offerings = armScoped.data ?? [];
      const options = offerings.map((o) => ({ id: o.subject.id, name: o.subject.name }));
      return {
        subjects: [...options].sort((a, b) => a.name.localeCompare(b.name)),
        isPending: armScoped.isPending,
      };
    }

    const active = (schoolWide.data ?? []).filter((s) => s.is_active !== false);
    const nameCounts = new Map<string, number>();
    active.forEach((s) => nameCounts.set(s.name, (nameCounts.get(s.name) ?? 0) + 1));

    const options = active.map((s) => ({
      id: s.id,
      name: s.name,
      disambiguator: (nameCounts.get(s.name) ?? 0) > 1 ? LEVEL_LABEL[s.level as SchoolLevelValue] : undefined,
    }));
    return {
      subjects: options.sort((a, b) =>
        a.name === b.name
          ? (a.disambiguator ?? "").localeCompare(b.disambiguator ?? "")
          : a.name.localeCompare(b.name),
      ),
      isPending: schoolWide.isPending,
    };
  }, [armId, armScoped.data, armScoped.isPending, schoolWide.data, schoolWide.isPending]);
}
