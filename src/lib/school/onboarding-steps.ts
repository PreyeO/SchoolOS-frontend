// Confirmed against accounts/enums.py OnboardingStep and
// UserService._ONBOARDING_STEP_ORDER — keys and order match exactly. This
// single ordered list drives the wizard's step index, the stepper UI, and
// resume-from-stage logic — if the backend's keys ever change, this is the
// only place to edit.
export const STEP_KEYS = ["branding", "academic_year", "classes", "subjects", "review"] as const;

export type StepKey = (typeof STEP_KEYS)[number];

export function stepIndex(step: StepKey): number {
  return STEP_KEYS.indexOf(step);
}
