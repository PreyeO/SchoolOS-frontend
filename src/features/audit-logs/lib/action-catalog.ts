import type { AuditCategoryKey } from "./audit-categories";

interface ActionMeta {
  category?: AuditCategoryKey;
  // Everything after the actor's name. Confirmed safe for every action the
  // backend logs: each one records the person who performed it as `actor`
  // (including invite.accepted, where the actor is the invitee themselves),
  // so an actor-first sentence always reads correctly.
  rest: (target: string) => string;
}

// The results models' __str__ ends in a status tag — "… (First Term) [locked]",
// "… [submitted]" — which is read at log time and so always restates the verb
// the sentence has just used. Dropped rather than shown twice. A no-op on any
// repr that doesn't carry one.
function withoutStatusTag(repr: string): string {
  return repr.replace(/\s*\[[^\]]*\]$/, "");
}

// One entry per action string the backend actually logs. Every AuditService.log
// / log_bulk call is a literal — there are no dynamically-built action names —
// so this list can be, and was, checked exhaustively against the backend across
// accounts/, academic/, attendance/ and results/.
//
// The sentences assume the shape of each action's target_repr, which is either
// an explicit string at the call site or the model's __str__. Both were read
// rather than guessed, because format-audit-entry strips a "… @ School" segment
// and everything before the last ": " — a repr in an unexpected shape would come
// out truncated rather than merely ugly.
export const ACTION_CATALOG: Record<string, ActionMeta> = {
  "user.registered": { rest: () => "created an account" },

  "invite.admin_created": { category: "invites", rest: (t) => `invited ${t} as an admin` },
  "invite.teacher_created": { category: "invites", rest: (t) => `invited ${t} as a teacher` },
  "invite.parent_created": { category: "invites", rest: (t) => `invited ${t} as a parent` },
  "invite.accepted": { category: "invites", rest: () => "accepted their invite" },
  "invite.resent": { category: "invites", rest: (t) => `resent an invite to ${t}` },

  "school_admin_role.created": { category: "roles", rest: (t) => `created the "${t}" role` },
  "school_admin_role.updated": { category: "roles", rest: (t) => `updated the "${t}" role` },
  "school_admin_role.deleted": { category: "roles", rest: (t) => `deleted the "${t}" role` },

  "school_admin_profile.created": { category: "admins", rest: (t) => `added ${t} as an admin` },
  "school_admin_profile.role_assigned": { category: "admins", rest: (t) => `changed the role for ${t}` },
  "school_admin_profile.role_unassigned": { category: "admins", rest: (t) => `removed the role from ${t}` },

  "student_profile.created": { category: "students", rest: (t) => `added student ${t}` },
  "student_profile.password_reissued": { category: "students", rest: (t) => `reissued the password for ${t}` },

  // The repr already begins "enrollment of …", so the sentence completes it
  // rather than repeating the word. Fires both when a student is first added and
  // on every later transfer — Enrollment rows are history and are never mutated.
  "enrollment.created": { category: "enrollment", rest: (t) => `recorded the ${t}` },

  "parent_student_link.created": { category: "links", rest: (t) => `linked ${t}` },
  "parent_student_link.deleted": { category: "links", rest: (t) => `unlinked ${t}` },

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
  "attendance.marked": { category: "attendance", rest: (t) => `marked attendance — ${t}` },
  "attendance.updated": { category: "attendance", rest: (t) => `changed an attendance mark — ${t}` },

  "score.entered": { category: "scores", rest: (t) => `entered a score: ${t}` },
  "score.updated": { category: "scores", rest: (t) => `changed a score: ${t}` },

  "class_arm_subject_result_submission.submitted": {
    category: "results",
    rest: (t) => `submitted results for ${withoutStatusTag(t)}`,
  },
  "class_arm_subject_result_submission.approved": {
    category: "results",
    rest: (t) => `approved results for ${withoutStatusTag(t)}`,
  },
  "class_arm_subject_result_submission.rejected": {
    category: "results",
    rest: (t) => `sent results back for ${withoutStatusTag(t)}`,
  },
  "class_arm_subject_result_submission.unlocked": {
    category: "results",
    rest: (t) => `reopened results for ${withoutStatusTag(t)}`,
  },
  "class_arm_result.locked": {
    category: "results",
    rest: (t) => `locked the results for ${withoutStatusTag(t)}`,
  },
  "class_arm_result.unlocked": {
    category: "results",
    rest: (t) => `unlocked the results for ${withoutStatusTag(t)}`,
  },

  // Repr is "Remark for STU001 (First Term)" — the leading "Remark for " is
  // dropped so the sentence doesn't say "remark" twice. A no-op if the backend
  // ever changes that prefix.
  "student_result_remark.class_teacher_remark_set": {
    category: "results",
    rest: (t) => `set the form teacher's remark — ${t.replace(/^Remark for /, "")}`,
  },
  "student_result_remark.principal_remark_set": {
    category: "results",
    rest: (t) => `set the principal's remark — ${t.replace(/^Remark for /, "")}`,
  },

  "behavioral_trait.created": { category: "traits", rest: (t) => `added behaviour trait ${t}` },
  "behavioral_trait.updated": { category: "traits", rest: (t) => `updated behaviour trait ${t}` },
  "behavioral_trait.deactivated": {
    category: "traits",
    rest: (t) => `deactivated behaviour trait ${t}`,
  },
  "behavioral_trait.deleted": { category: "traits", rest: (t) => `deleted behaviour trait ${t}` },
  "student_trait_rating.rated": { category: "traits", rest: (t) => `rated ${t}` },
  "student_trait_rating.updated": { category: "traits", rest: (t) => `changed a rating: ${t}` },

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

  "school.created": { category: "school", rest: () => "created the school" },
  "school.updated": { category: "school", rest: () => "updated the school profile" },
};

// Any action not in the catalog (a new one the backend adds later) still reads
// sensibly: "class_arm.renamed" -> "renamed <target>".
export function actionMeta(action: string): ActionMeta {
  return ACTION_CATALOG[action] ?? { rest: (t) => `${(action.split(".")[1] ?? action).replace(/_/g, " ")} ${t}`.trim() };
}
