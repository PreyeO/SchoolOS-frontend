// The real order a school has to be set up in, as far as the first moment the
// product does something: a register that can be marked.
//
// The old four-item checklist stopped at "subjects" and then said "fully set
// up", which wasn't true — at that point a school still can't enrol anyone or
// take a register. These are the same tasks an admin already has to do; the
// list only makes the order visible instead of leaving it to be discovered by
// hitting validation errors.
//
// Every incomplete step carries its consequence rather than just its name,
// because "no class teacher" doesn't obviously mean "attendance is impossible"
// unless you already know the model.

import type { TeachingUnitWords } from "@/lib/school/teaching-unit";

// Arms are deliberately absent. Every class the backend creates already carries
// a system arm, so enrolment, attendance and teaching all work without the admin
// ever naming one — a school that runs a single stream per class is complete as
// it stands, and asking it to invent "Primary 1 A" is asking it to model
// something it doesn't have. Arms remain available on Classes & Arms for schools
// that do stream. The one genuinely broken state — a class carrying no arm at
// all, only possible on rows predating that behaviour — is already reported
// there, and on the attendance and teaching-assignment screens.
export type SetupStepKey =
  | "branding"
  | "academic_year"
  | "current_term"
  | "classes"
  | "subjects"
  | "teachers"
  | "class_teachers"
  | "students"
  | "class_subjects"
  | "subject_teachers";

// Copy that has to name the unit holding a register takes the school's own word
// for it rather than hardcoding "arm" — see TeachingUnitWords. Plain strings
// stay plain: most steps never need the noun, and making all of them functions
// would be ceremony for nothing.
type StepText = string | ((unit: TeachingUnitWords) => string);

export function resolveStepText(text: StepText, unit: TeachingUnitWords): string {
  return typeof text === "function" ? text(unit) : text;
}

export interface SetupStep {
  key: SetupStepKey;
  label: StepText;
  // Shown only while the step is outstanding. States what stays broken until
  // it's done — never a restatement of the label.
  consequence: StepText;
  href: string;
  cta: string;
}

export interface SetupStage {
  label: string;
  steps: SetupStep[];
}

import { SETUP_STAGES } from "./setup-stages";

export { SETUP_STAGES };

export const ALL_SETUP_STEPS: SetupStep[] = SETUP_STAGES.flatMap((s) => s.steps);

// The subset that has to be true before a register can be marked at all. Used
// to decide when the card may finally say the school is ready — "ready" means
// the product can do its first real job, not that every box is ticked.
// class_teachers is deliberately absent: its own tick needs *every* class
// staffed, which is a stricter bar than "can a register be marked at all".
// useSetupStatus adds the weaker "at least one" test separately.
export const REGISTER_PREREQUISITES: SetupStepKey[] = [
  "academic_year",
  "current_term",
  "classes",
  "teachers",
  "students",
];
