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
export const ACADEMIC_SESSION_ENDPOINTS = {
  LIST: () => `/api/academic-sessions/`,
  DETAIL: (id: string) => `/api/academic-sessions/${id}/`,
  ADD_PERIOD: (id: string) => `/api/academic-sessions/${id}/academic-periods/`,
} as const;

export const ACADEMIC_PERIOD_ENDPOINTS = {
  DETAIL: (id: string) => `/api/academic-periods/${id}/`,
  // Dedicated one-click action for term rollover. PATCHing is_current also
  // works (update_academic_period unsets any other current period too), but
  // this keeps the common case a single POST with no other fields in play.
  MARK_CURRENT: (id: string) => `/api/academic-periods/${id}/mark-current/`,
} as const;

export const CLASS_ENDPOINTS = {
  LIST: () => `/api/classes/`,
  DETAIL: (id: string) => `/api/classes/${id}/`,
  ADD_ARM: (id: string) => `/api/classes/${id}/arms/`,
} as const;

// assign/unassign both require manage_academic_structure and return the updated
// arm (with class_teacher nested, null after unassign). The backend rejects any
// teacher whose teacher_type isn't 'class' or 'both' — the picker filters to
// those, so a rejection here means the teacher's type changed under us.
export const CLASS_ARM_ENDPOINTS = {
  DETAIL: (id: string) => `/api/class-arms/${id}/`,
  ASSIGN_CLASS_TEACHER: (id: string) => `/api/class-arms/${id}/assign-class-teacher/`,
  UNASSIGN_CLASS_TEACHER: (id: string) => `/api/class-arms/${id}/unassign-class-teacher/`,
} as const;

export const SUBJECT_ENDPOINTS = {
  LIST: () => `/api/subjects/`,
  DETAIL: (id: string) => `/api/subjects/${id}/`,
} as const;

// list/create/destroy all require manage_academic_structure; MINE is open to any
// school member so a teacher can read their own load. Note the asymmetry between
// read and write: the list filters on the FK names (?class_arm=, ?teacher=,
// ?subject=) while the create body takes class_arm_id/subject_id/
// teacher_profile_id. Confirmed against academic/views.py.
// Which subjects a class arm officially takes, independent of who teaches them.
// Arms under one class diverge (a science-track arm vs an arts-track one), so
// this can't be derived from teacher assignments — and the backend requires an
// offering to exist before a teacher can be assigned to that subject.
// Read filter is ?class_arm=; the create body takes class_arm_id + subject_id.
export const CLASS_ARM_SUBJECT_ENDPOINTS = {
  LIST: () => `/api/class-arm-subjects/`,
  DETAIL: (id: string) => `/api/class-arm-subjects/${id}/`,
} as const;

// Results. Score entry is authorised per-teacher rather than by permission
// string — only the teacher holding the SubjectAssignment for a (class_arm,
// subject) pair may write, with no admin override, mirroring attendance.
export const SCORE_ENDPOINTS = {
  LIST: () => `/api/scores/`,
  BULK_ENTER: () => `/api/scores/bulk-enter/`,
} as const;

// One row per (class_arm, subject, academic_period), carrying the review status.
// Filter names are the plain FK fields, not *_id — they're filterset_fields.
export const RESULT_SUBMISSION_ENDPOINTS = {
  LIST: () => `/api/subject-result-submissions/`,
  SUBMIT: (id: string) => `/api/subject-result-submissions/${id}/submit/`,
  APPROVE: (id: string) => `/api/subject-result-submissions/${id}/approve/`,
  REJECT: (id: string) => `/api/subject-result-submissions/${id}/reject/`,
  UNLOCK: (id: string) => `/api/subject-result-submissions/${id}/unlock/`,
} as const;

export const SUBJECT_ASSIGNMENT_ENDPOINTS = {
  LIST: () => `/api/subject-assignments/`,
  DETAIL: (id: string) => `/api/subject-assignments/${id}/`,
  MINE: () => `/api/subject-assignments/my-assignments/`,
} as const;

// LIST is readable by teachers and by admins holding view_attendance. BULK_MARK
// is teacher-only — AttendanceService._authorize_marker rejects admins outright,
// with no permission that overrides it. Confirmed against attendance/services.py.
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
