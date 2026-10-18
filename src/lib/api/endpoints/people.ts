// Split from the former single endpoints.ts. Re-exported from ../endpoints,
// so every existing import path is unchanged.
// Trailing slashes are preserved exactly as the backend defines them.

// Visibility widened 2026-08-29, and it applies to BOTH routes below: as well
// as admins with view_attendance and any teacher, a student now sees their own
// records and a linked parent sees their children's — scoped server-side, the
// same way the fee ledger and report card already were. Before this, both
// returned an empty list to those personas rather than a 403, which failed
// silently.
//
// ?student= narrows to one student. Not optional for a parent with more than
// one child: without it they get every child's rows interleaved with no way to
// tell them apart at a glance.
export const ATTENDANCE_ENDPOINTS = {
  // Takes ?class_arm_id=, ?student=, ?date= (exact) and ?date_after=/
  // ?date_before= for a range. The register screen still uses the exact date;
  // anything wanting a span should prefer DAILY_SUMMARY below, which totals
  // server-side instead of paginating every record.
  LIST: () => `/api/attendance/`,
  BULK_MARK: () => `/api/attendance/bulk-mark/`,
  // Teachers only, like BULK_MARK. Deletes the listed students' marks for one
  // arm/date and leaves a tombstone, so an older queued mark can't recreate
  // them. student_ids is required: "clear the register" means sending all.
  BULK_CLEAR: () => `/api/attendance/bulk-clear/`,
  // One row per date: { date, present, total }. ?date_after=/?date_before=
  // default to the trailing 7 days — so a student whose last mark was a
  // fortnight ago gets [] unless an explicit range is passed. ?class_arm_id=
  // narrows to one arm, ?student= to one student.
  //
  // A different gate from students/enrollment-summary, which needs
  // view_analytics, even though both feed the same dashboard row.
  //
  // Returns a bare array. A day with total 0 is possible (nobody marked), so
  // any rate derived from this must guard the divide.
  DAILY_SUMMARY: () => `/api/attendance/daily-summary/`,
} as const;

export const GRADING_SYSTEM_ENDPOINTS = {
  LIST: () => `/api/grading-systems/`,
  DETAIL: (id: string) => `/api/grading-systems/${id}/`,
} as const;

export const AUDIT_LOG_ENDPOINTS = {
  LIST: () => `/api/audit-logs/`,
} as const;

// Replaces the old flat ENDPOINTS.ROLES (no trailing slash, GET-only — worked
// only via Django's APPEND_SLASH redirect, same class of bug already fixed for
// onboarding's stage/review endpoints). The new CRUD + permissions-catalog
// actions include POST/PATCH/DELETE, which don't get that redirect safety net.
export const ROLE_ENDPOINTS = {
  LIST: () => `/api/school-admin-roles/`,
  DETAIL: (id: string) => `/api/school-admin-roles/${id}/`,
  PERMISSIONS: () => `/api/school-admin-roles/permissions/`,
} as const;

// LIST/RESEND require school membership; DETAIL (by token) and ACCEPT are
// public (AllowAny on the backend) — used by the accept-invite page before
// the invitee has any session at all.
export const INVITE_ENDPOINTS = {
  LIST: () => `/api/invites/`,
  DETAIL: (token: string) => `/api/invites/${token}/`,
  ACCEPT: () => `/api/invites/accept/`,
  RESEND: (id: string) => `/api/invites/${id}/resend/`,
} as const;

// DRF-router generated, trailing slash throughout.
//
// The three OFFBOARD routes below (teacher/admin/parent) share one body,
// { reason }, and one response, MembershipSummary. Each has its own gate:
// teacher -> edit_staff, admin -> manage_roles, parent -> add_students.
export const TEACHER_ENDPOINTS = {
  LIST: () => `/api/teachers/`,
  // GET needs view_staff. PATCH (2026-10-13, no PUT) is CanEditTeacherProfile:
  // an admin with edit_staff sends user + staff-record fields; the teacher
  // themselves sends user fields only (a staff-record field 403s the lot).
  DETAIL: (id: string) => `/api/teachers/${id}/`,
  // Unassigns every class-teacher and subject assignment, then DELETES the
  // teacher profile — DETAIL 404s afterwards.
  OFFBOARD: (id: string) => `/api/teachers/${id}/offboard/`,
} as const;

// SchoolOS's own staff, not a school's. Platform-admin only
// (view_platform_users). Read-only by necessity as well as design: POST
// returns 405 — creating platform admins is a manage.py createsuperuser job,
// not an API one.
export const PLATFORM_ADMIN_ENDPOINTS = {
  LIST: () => `/api/platform-admins/`,
  DETAIL: (id: string) => `/api/platform-admins/${id}/`,
} as const;

// Both LIST and DETAIL return only CURRENT parents unless ?is_parent= is sent:
// ?is_parent=false gives former (offboarded) parents ONLY, so a former
// parent's detail 404s without it, and a current parent's 404s with it.
export const PARENT_ENDPOINTS = {
  LIST: () => `/api/parents/`,
  DETAIL: (id: string) => `/api/parents/${id}/`,
  // Clears is_parent only — the profile and child links survive as history.
  // Re-inviting the same email turns it back on with the same profile.
  OFFBOARD: (id: string) => `/api/parents/${id}/offboard/`,
} as const;

// Create body uses parent_profile_id/student_profile_id (confirmed live —
// not parent_profile/student_profile). No update action; change
// relationship/is_primary_contact via delete + recreate.
export const PARENT_STUDENT_LINK_ENDPOINTS = {
  LIST: () => `/api/parent-student-links/`,
  DETAIL: (id: string) => `/api/parent-student-links/${id}/`,
} as const;

// School's own admin staff (distinct from the Staff/Teacher directory).
// assign-role/unassign-role both require manage_roles.
export const ADMIN_ENDPOINTS = {
  LIST: () => `/api/school-admins/`,
  DETAIL: (id: string) => `/api/school-admins/${id}/`,
  ASSIGN_ROLE: (id: string) => `/api/school-admins/${id}/assign-role/`,
  UNASSIGN_ROLE: (id: string) => `/api/school-admins/${id}/unassign-role/`,
  // manage_roles. Unassigns the role, then DELETES the admin profile. 400s for
  // the Owner. No self-check server-side — the UI must stop an admin
  // offboarding themselves.
  OFFBOARD: (id: string) => `/api/school-admins/${id}/offboard/`,
} as const;
