export const ENDPOINTS = {
  USERS: "/api/users/",
  LOGIN: "/api/auth/login/",
  REFRESH: "/api/auth/refresh/",
  VERIFY_EMAIL: "/api/auth/verify-email/",
  RESEND_OTP: "/api/auth/resend-verification/",
  SCHOOL: "/api/auth/school/",
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
} as const;

// Id-scoped endpoint builders. Confirmed against accounts/urls.py (SchoolViewSet
// on a DefaultRouter, trailing_slash=True by default) — every action here,
// including onboarding/advance and onboarding/review, carries a trailing slash.
export const SCHOOL_ENDPOINTS = {
  // GET (school detail, includes levels) and PATCH (branding update) both hit
  // this same resource. Do NOT use the school-list endpoint for levels — its
  // summary omits them and only has school_type.
  DETAIL: (id: string) => `/api/schools/${id}/`,
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
