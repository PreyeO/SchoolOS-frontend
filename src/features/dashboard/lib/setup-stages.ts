// The checklist's stage/step content, split from the types and derived lookups
// in setup-steps.ts. Pure copy and ordering — no logic.

import type { SetupStage } from "./setup-steps";

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

