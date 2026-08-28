// Split from the former single endpoints.ts. Re-exported from ../endpoints,
// so every existing import path is unchanged.
// Trailing slashes are preserved exactly as the backend defines them.

export const ENDPOINTS = {
  USERS: "/api/users/",
  LOGIN: "/api/auth/login/",
  REFRESH: "/api/auth/refresh/",
  VERIFY_EMAIL: "/api/auth/verify-email/",
  RESEND_OTP: "/api/auth/resend-verification/",
  SCHOOL: "/api/auth/school/",
  // The caller's school-scoped profile, with a block per active persona. The one
  // place a non-admin can read their own context — a teacher's arms and subjects,
  // a parent's children, a student's class — none of which the directories expose
  // to them. Requires school context: an owner with no school yet gets a 403.
  ME: "/api/auth/me/",
  PASSWORD_RESET_REQUEST: "/api/auth/password-reset/request/",
  PASSWORD_RESET_CONFIRM: "/api/auth/password-reset/confirm/",
  ACADEMIC_SESSIONS_WITH_PERIODS: "/api/academic-sessions/with-periods/",
  CLASSES_BULK: "/api/classes/bulk/",
  // Both DO take a trailing slash. These were declared without one under a
  // comment claiming that was the confirmed contract; the live URL resolver
  // says otherwise, and each call was silently costing a 301 round trip
  // (APPEND_SLASH=True quietly redirected and axios followed, so it "worked").
  // It would have broken outright the moment APPEND_SLASH was turned off —
  // a common production hardening — taking onboarding's class and subject
  // template steps with it. Verified against the router, not assumed.
  CLASSES_TEMPLATES: "/api/classes/templates/",
  SUBJECTS_TEMPLATES: "/api/subjects/templates/",
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
  // Self-service capacity change, gated on manage_school_settings. Refuses to
  // go below the school's current ACTIVE student headcount, and returns a
  // capacity_adjustment record (prorated charge) when the change is an increase
  // on an already-subscribed school. Not the same as PATCH DETAIL — capacity is
  // excluded from SchoolBrandingUpdateSerializer precisely so it can't be
  // changed without going through this billing path.
  UPDATE_CAPACITY: (id: string) => `/api/schools/${id}/update-capacity/`,
  // Public (AllowAny) name search, ?q= must be >= 2 chars or it 400s. Exists
  // specifically to warn a would-be owner about duplicate schools at
  // create-school time — school NAMES have no uniqueness constraint (only slug
  // does), so this is advisory, never a gate.
  SEARCH: () => `/api/schools/search/`,
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
