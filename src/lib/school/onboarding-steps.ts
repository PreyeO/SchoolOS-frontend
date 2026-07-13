// ⚠️ CONFIRM with backend: exact step keys and order, and that advancing
// "review" is what marks onboarding complete. This single ordered list drives
// the wizard's step index, the stepper UI, and resume-from-stage logic — if
// the backend's keys differ, this is the only place to edit.
export const STEP_KEYS = ["branding", "academic_year", "classes", "subjects", "review"] as const;

export type StepKey = (typeof STEP_KEYS)[number];

export function stepIndex(step: StepKey): number {
  return STEP_KEYS.indexOf(step);
}
