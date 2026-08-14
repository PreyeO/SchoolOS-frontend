"use client";

import { useQuery } from "@tanstack/react-query";

import { DEFAULT_ACCENT_COLOR, DEFAULT_PRIMARY_COLOR } from "@/data/color-presets";
import { teachingUnitWords } from "@/lib/school/teaching-unit";
import { useAcademicSessions } from "@/features/settings/hooks/use-academic-sessions";
import { useClasses } from "@/features/settings/hooks/use-classes";
import { useSubjects } from "@/features/settings/hooks/use-subjects";
import { useSchoolStore } from "@/stores/school-store";

import { getSetupCounts } from "../api/setup-counts-api";
import {
  ALL_SETUP_STEPS,
  REGISTER_PREREQUISITES,
  type SetupStepKey,
} from "../lib/setup-steps";

// Derived from real data rather than a client-side flag, so a step done via
// Settings (not just the onboarding wizard) is reflected too — the wizard-only
// flag this replaced never saw those paths and stayed stuck on "undone".
//
// Four of the eleven steps need no request of their own: the classes response
// already nests arms with is_default and class_teacher, and the sessions
// response already nests periods with is_current.
export function useSetupStatus() {
  const currentSchool = useSchoolStore((s) => s.currentSchool);
  const { data: sessions } = useAcademicSessions();
  const { data: classes } = useClasses();
  const { data: subjects } = useSubjects();

  const { data: counts } = useQuery({
    queryKey: ["setup-counts"],
    queryFn: getSetupCounts,
    enabled: !!currentSchool,
  });

  const branding = !!(
    currentSchool &&
    (currentSchool.primaryColor !== DEFAULT_PRIMARY_COLOR ||
      currentSchool.accentColor !== DEFAULT_ACCENT_COLOR ||
      currentSchool.logoUrl ||
      currentSchool.motto)
  );

  const allArms = (classes ?? []).flatMap((c) => c.arms);
  const armsWithTeacher = allArms.filter((a) => !!a.class_teacher).length;

  const setupStatus: Record<SetupStepKey, boolean> = {
    branding,
    academic_year: (sessions?.length ?? 0) > 0,
    // Exactly one period school-wide may be current; the wizard enforces it at
    // creation, but a term rollover or a skipped step can leave none.
    current_term: (sessions ?? []).some((s) => s.periods.some((p) => p.is_current)),
    classes: (classes?.length ?? 0) > 0,
    subjects: (subjects?.length ?? 0) > 0,
    teachers: (counts?.teachers ?? 0) > 0,
    // Counts the placeholder arm too: a class with no named arms still holds
    // its class teacher there, so excluding it would under-report coverage.
    //
    // Every one of them, because the step says "each". A school staffing its
    // classes one at a time sees no movement here for a long time, which is why
    // the checklist renders stepProgress alongside it — the tick is all-or-
    // nothing, the number isn't.
    class_teachers: allArms.length > 0 && armsWithTeacher === allArms.length,
    students: (counts?.students ?? 0) > 0,
    class_subjects: (counts?.classSubjects ?? 0) > 0,
    subject_teachers: (counts?.subjectTeachers ?? 0) > 0,
  };

  const completedCount = ALL_SETUP_STEPS.filter((s) => setupStatus[s.key]).length;
  // "Ready" is not "every box ticked" — it's the point the product can do its
  // first real job. Optional polish like branding shouldn't hold that back.
  //
  // One staffed class is the bar here, not all of them: that teacher can mark
  // that class's register today. Requiring full coverage told a school with 4 of
  // 12 classes staffed that it couldn't take a register, while four teachers
  // were already able to.
  const canTakeRegister =
    REGISTER_PREREQUISITES.every((key) => setupStatus[key]) && armsWithTeacher > 0;

  return {
    setupStatus,
    // Partial progress for steps that are done "for each X" rather than once.
    // Without it, staffing 4 of 12 classes looks identical to staffing none, and
    // the step reads as broken rather than as underway.
    stepProgress: {
      class_teachers: { done: armsWithTeacher, total: allArms.length },
    } as Partial<Record<SetupStepKey, { done: number; total: number }>>,
    // "class" or "arm", whichever this school actually uses — the checklist
    // interpolates it rather than telling a single-stream school about arms.
    unitWords: teachingUnitWords(classes),
    completedCount,
    totalSteps: ALL_SETUP_STEPS.length,
    isComplete: completedCount === ALL_SETUP_STEPS.length,
    canTakeRegister,
    currentSchool,
  };
}
