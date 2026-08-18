// Split from the former single endpoints.ts. Re-exported from ../endpoints,
// so every existing import path is unchanged.
// Trailing slashes are preserved exactly as the backend defines them.

export const ATTENDANCE_ENDPOINTS = {
  LIST: () => `/api/attendance/`,
  BULK_MARK: () => `/api/attendance/bulk-mark/`,
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
