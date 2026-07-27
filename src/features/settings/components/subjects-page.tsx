"use client";

import { SubjectsReviewSection } from "@/features/onboarding/components/review/subjects-review-section";
import { useSchoolLevels } from "@/lib/school/use-school-levels";
import { useSubjects } from "../hooks/use-subjects";

export function SubjectsPage() {
  const { data: subjects, isPending, isError } = useSubjects();
  const { levels: schoolLevels } = useSchoolLevels();

  if (isPending) {
    return <p className="text-sm text-n-400" role="status">Loading your subjects…</p>;
  }

  if (isError) {
    return <p className="text-sm text-clay" role="alert">Couldn&rsquo;t load your subjects. Please refresh.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Subjects</h1>
        <p className="mt-1 text-sm text-n-500">Manage the subjects taught at each level.</p>
      </div>
      <SubjectsReviewSection subjects={subjects} schoolLevels={schoolLevels} />
    </div>
  );
}
