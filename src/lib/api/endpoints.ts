export const ENDPOINTS = {
  USERS: "/api/users/",
  LOGIN: "/api/auth/login/",
  REFRESH: "/api/auth/refresh/",
  VERIFY_EMAIL: "/api/auth/verify-email/",
  RESEND_OTP: "/api/auth/resend-verification/",
  SCHOOL: "/api/auth/school/",
  PASSWORD_RESET_REQUEST: "/api/auth/password-reset/request/",
  PASSWORD_RESET_CONFIRM: "/api/auth/password-reset/confirm/",
  ACADEMIC_SESSIONS_WITH_PERIODS: "/api/academic-sessions/with-periods/",
  CLASSES_BULK: "/api/classes/bulk/",
  // No trailing slash — per the confirmed backend contract.
  CLASSES_TEMPLATES: "/api/classes/templates",
  SUBJECTS_TEMPLATES: "/api/subjects/templates",
  SUBJECTS_BULK: "/api/subjects/bulk/",
  INVITE_ADMIN: "/api/invites/invite-admin/",
  INVITE_TEACHER: "/api/invites/invite-teacher/",
  INVITE_PARENT: "/api/invites/invite-parent/",
  INVITE_STUDENT: "/api/invites/invite-student/",
  // Confirmed live: SchoolViewSet.get_queryset() filters to the caller's own
  // active memberships for non-platform-admins, and its list/retrieve actions
  // only require IsAuthenticated (not IsSchoolMember) — so this works with
  // any valid token, scoped to any one of the user's schools or unscoped.
  SWITCH_SCHOOL: "/api/auth/switch-school/",
} as const;

// Id-scoped endpoint builders. Confirmed against accounts/urls.py (SchoolViewSet
// on a DefaultRouter, trailing_slash=True by default) — every action here,
// including onboarding/advance and onboarding/review, carries a trailing slash.
export const SCHOOL_ENDPOINTS = {
  // GET (school detail, includes levels) and PATCH (branding update) both hit
  // this same resource. Do NOT use the school-list endpoint for levels — its
  // summary omits them and only has school_type.
  DETAIL: (id: string) => `/api/schools/${id}/`,
  // Returns every school the caller has an active membership at (not just the
  // one their current token is scoped to) — confirmed live with a two-school
  // test account. Summary shape only (no branding colors — see get-my-schools.ts).
  LIST: () => `/api/schools/`,
  ONBOARDING_STAGE: (id: string) => `/api/schools/${id}/onboarding/`,
  ONBOARDING_ADVANCE: (id: string) => `/api/schools/${id}/onboarding/advance/`,
  ONBOARDING_REVIEW: (id: string) => `/api/schools/${id}/onboarding/review/`,
} as const;

// Confirmed against academic/urls.py + academic/views.py — all DRF-router
// generated, so all carry a trailing slash like CLASSES_BULK/SUBJECTS_BULK above.
export const ACADEMIC_SESSION_ENDPOINTS = {
  LIST: () => `/api/academic-sessions/`,
  DETAIL: (id: string) => `/api/academic-sessions/${id}/`,
  ADD_PERIOD: (id: string) => `/api/academic-sessions/${id}/academic-periods/`,
} as const;

export const ACADEMIC_PERIOD_ENDPOINTS = {
  DETAIL: (id: string) => `/api/academic-periods/${id}/`,
} as const;

export const CLASS_ENDPOINTS = {
  LIST: () => `/api/classes/`,
  DETAIL: (id: string) => `/api/classes/${id}/`,
  ADD_ARM: (id: string) => `/api/classes/${id}/arms/`,
} as const;

export const CLASS_ARM_ENDPOINTS = {
  DETAIL: (id: string) => `/api/class-arms/${id}/`,
} as const;

export const SUBJECT_ENDPOINTS = {
  LIST: () => `/api/subjects/`,
  DETAIL: (id: string) => `/api/subjects/${id}/`,
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
