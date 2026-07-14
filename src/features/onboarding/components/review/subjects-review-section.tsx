"use client";

import { toast } from "sonner";

import { SCHOOL_LEVELS, type SchoolLevelValue } from "@/data/school-levels";
import type { SubjectResponse } from "../../types";
import { useAddSubjects } from "../../hooks/use-subject-mutations";
import { AddSubjectControl } from "../add-subject-control";
import { SubjectRowReview } from "./subject-row-review";
import { ReviewSectionShell } from "./review-section-shell";

interface Props {
  subjects: SubjectResponse[];
  schoolLevels: SchoolLevelValue[];
}

export function SubjectsReviewSection({ subjects, schoolLevels }: Props) {
  const addSubjects = useAddSubjects();

  const groups = SCHOOL_LEVELS.filter((l) => schoolLevels.includes(l.value))
    .map((l) => ({ level: l, items: subjects.filter((s) => s.level === l.value) }))
    .filter((g) => g.items.length > 0);

  // Mirrors the dedupe check use-subject-entries.ts does client-side during
  // onboarding — here it's just guarding against the backend's own duplicate
  // rejection (bulk_create_subjects rejects the whole batch on any collision).
  function handleAdd(name: string, levels: SchoolLevelValue[]): number {
    const fresh = levels.filter(
      (level) => !subjects.some((s) => s.level === level && s.name.trim().toLowerCase() === name.toLowerCase()),
    );
    if (fresh.length === 0) {
      toast.error(`"${name}" already exists for the selected level(s).`);
      return 0;
    }
    addSubjects.mutate({ subjects: fresh.map((level) => ({ name, level, is_core: false })) });
    return fresh.length;
  }

  return (
    <ReviewSectionShell title="Subjects">
      {groups.length === 0 ? (
        <p className="text-sm text-n-400 italic">No subjects yet.</p>
      ) : (
        <div className="space-y-3">
          {groups.map(({ level, items }) => (
            <div key={level.value}>
              <p className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-n-400">{level.label}</p>
              <div className="flex flex-wrap gap-1.5">
                {items.map((s) => (
                  <SubjectRowReview key={s.id} subject={s} schoolLevels={schoolLevels} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      <AddSubjectControl schoolLevels={schoolLevels} onAdd={handleAdd} />
    </ReviewSectionShell>
  );
}
