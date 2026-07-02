export const ENDPOINTS = {
  USERS: "/api/users/",
  LOGIN: "/api/auth/login/",
  VERIFY_EMAIL: "/api/auth/verify-email/",
  RESEND_OTP: "/api/auth/resend-verification/",
  SCHOOL: "/api/auth/school/",
  PATCH_SCHOOL: "/api/auth/school/",
  SCHOOL_LOGO: "/api/auth/school/logo/",
  SESSIONS: "/api/sessions/",
  CLASSES: "/api/classes/",
  CLASSES_BULK: "/api/classes/bulk/",
  SUBJECTS_BULK: "/api/subjects/bulk/",
  COMPLETE_ONBOARDING: "/api/onboarding/complete/",
  SETUP_STATUS: "/api/onboarding/status/",
  INVITE_ADMIN: "/api/invites/invite-admin/",
  INVITE_TEACHER: "/api/invites/invite-teacher/",
  INVITE_PARENT: "/api/invites/invite-parent/",
  INVITE_STUDENT: "/api/invites/invite-student/",
  // TODO confirm: real roles endpoint not provided yet — getRoles() is mocked
  // until this is confirmed. Update the path here once known.
  ROLES: "/api/roles/",
} as const;
