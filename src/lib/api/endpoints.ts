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
  ROLES: "/api/school-admin-roles",
} as const;

// Id-scoped endpoint builders. ⚠️ CONFIRM with backend: that PATCH here is the
// branding method, and the onboarding stage/advance/review paths and trailing
// slashes below are exact.
export const SCHOOL_ENDPOINTS = {
  PATCH: (id: string) => `/api/schools/${id}/`,
  ONBOARDING_STAGE: (id: string) => `/api/schools/${id}/onboarding`,
  ONBOARDING_ADVANCE: (id: string) => `/api/schools/${id}/onboarding/advance/`,
  ONBOARDING_REVIEW: (id: string) => `/api/schools/${id}/onboarding/review`,
} as const;
