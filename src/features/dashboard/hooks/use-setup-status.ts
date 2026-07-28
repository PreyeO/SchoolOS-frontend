"use client";

import { DEFAULT_ACCENT_COLOR, DEFAULT_PRIMARY_COLOR } from "@/data/color-presets";
import { useAcademicSessions } from "@/features/settings/hooks/use-academic-sessions";
import { useClasses } from "@/features/settings/hooks/use-classes";
import { useSubjects } from "@/features/settings/hooks/use-subjects";
import { useSchoolStore } from "@/stores/school-store";

// Derived from real data rather than a client-side flag, so a step done via
// Settings/Review (not just the onboarding wizard itself) is reflected too —
// the wizard-only `markSetupStep` flag it replaced never saw those paths and
// stayed stuck on "undone" forever once a school bypassed the wizard for a step.
export function useSetupStatus() {
  const currentSchool = useSchoolStore((s) => s.currentSchool);
  const { data: sessions } = useAcademicSessions();
  const { data: classes } = useClasses();
  const { data: subjects } = useSubjects();

  const branding = !!(
    currentSchool &&
    (currentSchool.primaryColor !== DEFAULT_PRIMARY_COLOR ||
      currentSchool.accentColor !== DEFAULT_ACCENT_COLOR ||
      currentSchool.logoUrl ||
      currentSchool.motto)
  );

  const setupStatus = {
    branding,
    academic_year: (sessions?.length ?? 0) > 0,
    classes: (classes?.length ?? 0) > 0,
    subjects: (subjects?.length ?? 0) > 0,
  };

  const isComplete = Object.values(setupStatus).every(Boolean);
  const completedCount = Object.values(setupStatus).filter(Boolean).length;

  return { setupStatus, isComplete, completedCount, totalSteps: 4, currentSchool };
}
