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

export const SETUP_STAGES: SetupStage[] = [
  {
    label: "Your school",
    steps: [
      {
        key: "branding",
        label: "Add your logo and colours",
        consequence: "Report cards and the app still use SchoolOS defaults.",
        href: "/settings/school",
        cta: "School profile",
      },
      {
        key: "academic_year",
        label: "Create your academic year",
        consequence: "Nothing can be dated to a session until one exists.",
        href: "/settings/sessions",
        cta: "Sessions & Terms",
      },
      {
        key: "current_term",
        label: "Mark the current term",
        consequence:
          "Enrolling and adding students both fail without one, and registers have nobody to list.",
        href: "/settings/sessions",
        cta: "Sessions & Terms",
      },
    ],
  },
  {
    label: "Structure",
    steps: [
      {
        key: "classes",
        label: "Add your classes",
        consequence: "There's nothing to enrol students into.",
        href: "/classes",
        cta: "Classes & Arms",
      },
      {
        key: "subjects",
        label: "Choose the subjects you teach",
        consequence: "Classes can't be given subjects, and results have nothing to score.",
        href: "/subjects",
        cta: "Subjects",
      },
    ],
  },
  {
    label: "Your people",
    steps: [
      {
        key: "teachers",
        label: "Invite your teachers",
        consequence: "There's nobody to make a form teacher or assign a subject to.",
        href: "/invitations?persona=teacher",
        cta: "Invite teachers",
      },
      {
        key: "class_teachers",
        label: (unit) => `Assign a form teacher to each ${unit.one}`,
        // Deliberately noun-free: a register is only markable by the teacher
        // assigned to it, and that's true whether the unit is a class or an arm.
        consequence: "A register can only be marked by the form teacher assigned to it.",
        href: "/classes",
        cta: "Classes & Arms",
      },
      {
        key: "students",
        label: "Add your students",
        // Was "...enrolled into an arm". Where they're enrolled isn't the point
        // of this step, and naming the unit only invited the question.
        consequence: "Registers stay empty until students are enrolled.",
        href: "/invitations?persona=student",
        cta: "Add students",
      },
    ],
  },
  {
    label: "Teaching",
    steps: [
      {
        key: "class_subjects",
        label: "Set which subjects each class takes",
        // The trailing clause only earns its place for a streamed school; to
        // everyone else "arms in the same class" is a sentence about nothing.
        consequence: (unit) =>
          unit.streamed
            ? "A teacher can't be assigned to a subject the class doesn't take — arms in the same class often differ."
            : "A teacher can't be assigned to a subject the class doesn't take.",
        href: "/teaching-assignments",
        cta: "Teaching Assignments",
      },
      {
        key: "subject_teachers",
        label: "Assign a teacher to each subject",
        consequence: "Only an assigned teacher can enter scores for a subject.",
        href: "/teaching-assignments",
        cta: "Teaching Assignments",
      },
    ],
  },
];

export const ALL_SETUP_STEPS: SetupStep[] = SETUP_STAGES.flatMap((s) => s.steps);

// The subset that has to be true before a register can be marked at all. Used
// to decide when the card may finally say the school is ready — "ready" means
// the product can do its first real job, not that every box is ticked.
export const REGISTER_PREREQUISITES: SetupStepKey[] = [
  "academic_year",
  "current_term",
  "classes",
  "teachers",
  "class_teachers",
  "students",
];
