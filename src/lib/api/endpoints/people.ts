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

// Read-only directories — all DRF-router generated, trailing slash throughout.
export const TEACHER_ENDPOINTS = {
  LIST: () => `/api/teachers/`,
  DETAIL: (id: string) => `/api/teachers/${id}/`,
} as const;

export const STUDENT_ENDPOINTS = {
  LIST: () => `/api/students/`,
  DETAIL: (id: string) => `/api/students/${id}/`,
  REISSUE_PASSWORD: (id: string) => `/api/students/${id}/reissue-password/`,
  // Enrolls into a class arm for the CURRENT session — used for first placement,
  // mid-session transfers and promotions alike. Needs edit_students, and 400s if
  // no period is marked is_current, or if the student is already in that arm this
  // session. HISTORY needs only view_students.
  ENROLL: (id: string) => `/api/students/${id}/enroll/`,
  ENROLLMENT_HISTORY: (id: string) => `/api/students/${id}/enrollment-history/`,
  // All three take ?academic_period_id= and share one visibility rule: admins
  // with view_results and teachers may preview at any stage; a parent or student
  // sees nothing until the arm's broadsheet is locked.
  REPORT_CARD: (id: string) => `/api/students/${id}/report-card/`,
  REPORT_CARD_PDF: (id: string) => `/api/students/${id}/report-card/pdf/`,
  // Raw HTML for an iframe, so a school can see section and theme changes
  // immediately. Deliberately not pixel-identical to the PDF — WeasyPrint's
  // paged-media rules don't apply in a browser.
  REPORT_CARD_PREVIEW: (id: string) => `/api/students/${id}/report-card/preview/`,
  // This student's live fee ledger for ?academic_period_id= (required — omitting
  // it is a 400, not a default to the current term).
  //
  // The one fees endpoint NOT gated on a permission string: the view sets
  // required_permission = None and FeesService._assert_ledger_visible decides
  // instead — an admin with view_fees, ANY teacher, the student themself, or a
  // linked parent. So a teacher can read this while 403ing on /api/payments/,
  // and the two must be gated separately in the UI.
  //
  // There is no broadsheet-style lock here; balances are always live.
  FEES: (id: string) => `/api/students/${id}/fees/`,
  // Cumulative headcount by month: { month, students }. Requires view_analytics
  // — the same gate as fee-items/collection-summary, and NOT the one the
  // attendance summary uses. Returns a bare array.
  ENROLLMENT_SUMMARY: () => `/api/students/enrollment-summary/`,
  // Both take a CSV `file` (multipart). Preview runs identical validation and
  // writes nothing (commit=False server-side); the plain route creates for
  // real. Gated the same as add-students (add_students school-side).
  BULK_IMPORT_PREVIEW: () => `/api/students/bulk-import/preview/`,
  BULK_IMPORT: () => `/api/students/bulk-import/`,
} as const;

// SchoolOS's own staff, not a school's. Platform-admin only
// (view_platform_users). Read-only by necessity as well as design: POST
// returns 405 — creating platform admins is a manage.py createsuperuser job,
// not an API one.
export const PLATFORM_ADMIN_ENDPOINTS = {
  LIST: () => `/api/platform-admins/`,
  DETAIL: (id: string) => `/api/platform-admins/${id}/`,
} as const;

// Teachers' free-form notes about students, persisting across class, session
// and teacher changes so context survives handover.
//
// Staff-internal: StudentNoteService.visible_notes admits an admin with
// view_students or ANY teacher, and returns an EMPTY QUERYSET to everyone
// else. A parent or student therefore gets 200 with count: 0 rather than a
// 403 — so never reuse this on a family-facing screen expecting an error to
// gate it.
//
// Writing requires a teacher profile (an admin without one gets 403), editing
// is restricted to the authoring teacher, and deleting is allowed for the
// author or an admin with edit_students. Filter with ?student=.
export const STUDENT_NOTE_ENDPOINTS = {
  LIST: () => `/api/student-notes/`,
  DETAIL: (id: string) => `/api/student-notes/${id}/`,
} as const;

export const PARENT_ENDPOINTS = {
  LIST: () => `/api/parents/`,
  DETAIL: (id: string) => `/api/parents/${id}/`,
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
} as const;
