// Split from the former single endpoints.ts. Re-exported from ../endpoints,
// so every existing import path is unchanged.
// Trailing slashes are preserved exactly as the backend defines them.

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

// The broadsheet for one (class_arm, period). Locking is what turns entered
// scores into a published result: it snapshots the arm's subjects, computes
// positions and averages, and is the moment parents and students can finally see
// a report card. Refused until every offered subject has an APPROVED submission.
export const CLASS_ARM_RESULT_ENDPOINTS = {
  LIST: () => `/api/class-arm-results/`,
  LOCK: () => `/api/class-arm-results/lock/`,
  UNLOCK: () => `/api/class-arm-results/unlock/`,
} as const;

// Keyed by level rather than a UUID — /api/report-card-settings/primary/. The
// row is created lazily on first read, so there's no "does this exist" step.
export const REPORT_CARD_SETTINGS_ENDPOINTS = {
  DETAIL: (level: string) => `/api/report-card-settings/${level}/`,
  OPTIONS: () => `/api/report-card-settings/options/`,
} as const;

// Behaviour traits are school+level+category scoped config (admin). Ratings are
// the teacher-side act, gated on being the arm's form teacher — same shape as
// score entry, and replay-safe for the same reasons.
export const TRAIT_ENDPOINTS = {
  LIST: () => `/api/behavioral-traits/`,
  DETAIL: (id: string) => `/api/behavioral-traits/${id}/`,
} as const;

export const TRAIT_RATING_ENDPOINTS = {
  LIST: () => `/api/trait-ratings/`,
  BULK_RATE: () => `/api/trait-ratings/bulk-rate/`,
} as const;

// One row per (student, term) holding both remarks, written by different people
// at different times. No marked_at anywhere — the server stamps *_remark_at — so
// unlike scores and ratings these are deliberately online-only.
export const REMARK_ENDPOINTS = {
  LIST: () => `/api/result-remarks/`,
  CLASS_TEACHER: () => `/api/result-remarks/class-teacher-remark/`,
  PRINCIPAL: () => `/api/result-remarks/principal-remark/`,
} as const;

export const SUBJECT_ASSIGNMENT_ENDPOINTS = {
  LIST: () => `/api/subject-assignments/`,
  DETAIL: (id: string) => `/api/subject-assignments/${id}/`,
  MINE: () => `/api/subject-assignments/my-assignments/`,
} as const;

// LIST is readable by teachers and by admins holding view_attendance. BULK_MARK
// is teacher-only — AttendanceService._authorize_marker rejects admins outright,
// with no permission that overrides it. Confirmed against attendance/services.py.
