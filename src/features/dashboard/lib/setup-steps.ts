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

export type SetupStepKey =
  | "branding"
  | "academic_year"
  | "current_term"
  | "classes"
  | "arms"
  | "subjects"
  | "teachers"
  | "class_teachers"
  | "students"
  | "class_subjects"
  | "subject_teachers";

export interface SetupStep {
  key: SetupStepKey;
  label: string;
  // Shown only while the step is outstanding. States what stays broken until
  // it's done — never a restatement of the label.
  consequence: string;
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
        key: "arms",
        label: "Give each class at least one arm",
        consequence:
          "Enrolment, attendance and teaching all attach to an arm, not a class.",
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
        consequence: "There's nobody to make a class teacher or assign a subject to.",
        href: "/invitations?persona=teacher",
        cta: "Invite teachers",
      },
      {
        key: "class_teachers",
        label: "Assign a class teacher to each arm",
        consequence: "Only a teacher can mark a register, and only for an arm that has one.",
        href: "/classes",
        cta: "Classes & Arms",
      },
      {
        key: "students",
        label: "Add your students",
        consequence: "Registers stay empty until students are enrolled into an arm.",
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
        consequence:
          "A teacher can't be assigned to a subject the class doesn't take — arms in the same class often differ.",
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
  "arms",
  "teachers",
  "class_teachers",
  "students",
];
