import type { ActionMeta } from "../action-catalog-data";

// Academic structure — classes, subjects, sessions, grading.
// Grouped by the backend app that emits the action, which is the seam the
// action strings themselves already follow.
export const ACADEMIC_ACTIONS: Record<string, ActionMeta> = {
  "academic_session.created": { category: "sessions", rest: (t) => `added session ${t}` },
  "academic_session.updated": { category: "sessions", rest: (t) => `updated session ${t}` },
  "academic_session.deleted": { category: "sessions", rest: (t) => `deleted session ${t}` },
  "academic_period.created": { category: "sessions", rest: (t) => `added term ${t}` },
  "academic_period.updated": { category: "sessions", rest: (t) => `updated term ${t}` },
  "academic_period.deleted": { category: "sessions", rest: (t) => `deleted term ${t}` },

  "class.created": { category: "classes", rest: (t) => `added class ${t}` },
  "class.updated": { category: "classes", rest: (t) => `updated class ${t}` },
  "class.deleted": { category: "classes", rest: (t) => `deleted class ${t}` },
  "class_arm.created": { category: "classes", rest: (t) => `added arm ${t}` },
  "class_arm.updated": { category: "classes", rest: (t) => `updated arm ${t}` },
  "class_arm.deleted": { category: "classes", rest: (t) => `deleted arm ${t}` },

  "subject.created": { category: "subjects", rest: (t) => `added subject ${t}` },
  "subject.updated": { category: "subjects", rest: (t) => `updated subject ${t}` },
  "subject.deleted": { category: "subjects", rest: (t) => `deleted subject ${t}` },

  // Which subjects an arm actually takes — a prerequisite of assigning a teacher
  // to one. The repr is "Maths @ Primary 1 - Primary 1 A", so it names the arm
  // itself and can't be confused with a school-wide subject.created above.
  "class_arm_subject_offering.created": {
    category: "subjects",
    rest: (t) => `added a class subject: ${t}`,
  },
  "class_arm_subject_offering.deleted": {
    category: "subjects",
    rest: (t) => `removed a class subject: ${t}`,
  },

  // Who teaches what. Both halves live here rather than under "classes": a
  // proprietor auditing staffing wants the form teacher and the subject teachers
  // in one visual bucket.
  "class_arm.class_teacher_assigned": {
    category: "teaching",
    rest: (t) => `set the form teacher for ${t}`,
  },
  "class_arm.class_teacher_unassigned": {
    category: "teaching",
    rest: (t) => `removed the form teacher from ${t}`,
  },
  "subject_assignment.created": {
    category: "teaching",
    rest: (t) => `added a teaching assignment: ${t}`,
  },
  "subject_assignment.deleted": {
    category: "teaching",
    rest: (t) => `removed a teaching assignment: ${t}`,
  },

  // Marking is an upsert keyed on (student, date), so the backend logs a first
  // mark and a later correction as two different actions. Keeping them distinct
  // here is the point — "changed a mark" is the one worth noticing.
  "grading_system.created": { category: "grading", rest: (t) => `set up a grading system: ${t}` },
  "grading_system.updated": { category: "grading", rest: (t) => `updated a grading system: ${t}` },
  "grading_system.deactivated": { category: "grading", rest: (t) => `deactivated a grading system: ${t}` },
  "grading_system.deleted": { category: "grading", rest: (t) => `deleted a grading system: ${t}` },
  "grade_component.created": { category: "grading", rest: (t) => `added a grading component: ${t}` },
  "grade_component.updated": { category: "grading", rest: (t) => `updated a grading component: ${t}` },
  "grade_component.deactivated": { category: "grading", rest: (t) => `deactivated a grading component: ${t}` },
  "grade_component.deleted": { category: "grading", rest: (t) => `removed a grading component: ${t}` },
  "grade_range.created": { category: "grading", rest: (t) => `added a grade range: ${t}` },
  "grade_range.updated": { category: "grading", rest: (t) => `updated a grade range: ${t}` },
  "grade_range.deleted": { category: "grading", rest: (t) => `removed a grade range: ${t}` },

};
