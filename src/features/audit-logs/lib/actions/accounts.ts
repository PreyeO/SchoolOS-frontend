import type { ActionMeta } from "../action-catalog-data";

// Accounts — users, schools, roles, invites, enrolment.
// Grouped by the backend app that emits the action, which is the seam the
// action strings themselves already follow.
export const ACCOUNTS_ACTIONS: Record<string, ActionMeta> = {

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
  // Explicit repr: "ANU/001223139 (Martha Suku)". Logged only when something
  // actually changed, and it carries a field-level before/after diff — which is
  // the point, since this covers medical and personal details.
  "student_profile.updated": { category: "students", rest: (t) => `updated student ${t}` },
  "student_profile.password_reissued": { category: "students", rest: (t) => `reissued the password for ${t}` },

  // The repr already begins "enrollment of …", so the sentence completes it
  // rather than repeating the word. Fires both when a student is first added and
  // on every later transfer — Enrollment rows are history and are never mutated.
  "enrollment.created": { category: "enrollment", rest: (t) => `recorded the ${t}` },
  // Written in bulk by promotion. Explicit repr, e.g. "Martha Suku
  // (ANU/001223139): JSS 1 JSS 1 A → JSS 2 JSS 2 A (2026/2027)" — shown whole.
  // Carries its own colon with no "@ SchoolName" beside it, so this is exactly
  // the shape cleanTargetRepr's school-strip gate exists to leave alone: before
  // that gate existed, the blind "cut at the last colon" step this repr never
  // needed took the student's name off with it, leaving only the move. Fixed
  // 2026-08-24 — see format-audit-entry.ts.
  "enrollment.updated": { category: "enrollment", rest: (t) => `moved ${t}` },

  "parent_student_link.created": { category: "links", rest: (t) => `linked ${t}` },
  "parent_student_link.deleted": { category: "links", rest: (t) => `unlinked ${t}` },

  "school.created": { category: "school", rest: () => "created the school" },
  "school.updated": { category: "school", rest: () => "updated the school profile" },
};
