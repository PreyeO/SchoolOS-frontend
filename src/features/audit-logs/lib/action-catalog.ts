import type { AuditCategoryKey } from "./audit-categories";

interface ActionMeta {
  category?: AuditCategoryKey;
  // Everything after the actor's name. Confirmed safe for every action the
  // backend logs: each one records the person who performed it as `actor`
  // (including invite.accepted, where the actor is the invitee themselves),
  // so an actor-first sentence always reads correctly.
  rest: (target: string) => string;
}

// One entry per action string the backend actually logs (every AuditService.log
// / log_bulk call across accounts/services.py + academic/services.py).
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

  "grading_system.created": { category: "grading", rest: (t) => `set up a grading system: ${t}` },
  "grading_system.updated": { category: "grading", rest: (t) => `updated a grading system: ${t}` },
  "grading_system.deleted": { category: "grading", rest: (t) => `deleted a grading system: ${t}` },
  "grade_component.created": { category: "grading", rest: (t) => `added a grading component: ${t}` },
  "grade_component.deleted": { category: "grading", rest: (t) => `removed a grading component: ${t}` },
  "grade_range.created": { category: "grading", rest: (t) => `added a grade range: ${t}` },
  "grade_range.deleted": { category: "grading", rest: (t) => `removed a grade range: ${t}` },

  "school.created": { category: "school", rest: () => "created the school" },
  "school.updated": { category: "school", rest: () => "updated the school profile" },
};

// Any action not in the catalog (a new one the backend adds later) still reads
// sensibly: "class_arm.renamed" -> "renamed <target>".
export function actionMeta(action: string): ActionMeta {
  return ACTION_CATALOG[action] ?? { rest: (t) => `${(action.split(".")[1] ?? action).replace(/_/g, " ")} ${t}`.trim() };
}

// Suggestions for the action filter's datalist. Verified to be an exact 1:1
// match with every action string the backend logs (40 as of 2026-08-05), so the
// list is a real reference rather than a guess — but the filter itself stays
// free text, since the backend matches ?action= with icontains and a partial
// like "deleted" or "grade" is often what someone actually wants.
export const ALL_AUDIT_ACTIONS = Object.keys(ACTION_CATALOG).sort();
