// Split from the former single endpoints.ts. Re-exported from ../endpoints,
// so every existing import path is unchanged.
// Trailing slashes are preserved exactly as the backend defines them.

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
  // One path, three very different jobs:
  //   GET    — full detail: class context, class teacher, offered subjects AND
  //            the currently-enrolled roster, in a single call. A hand-written
  //            retrieve action, not a mixin. Needs no permission string.
  //   PATCH  — renames the arm. Needs manage_academic_structure.
  //   DELETE — removes it. Same permission.
  DETAIL: (id: string) => `/api/class-arms/${id}/`,
  ASSIGN_CLASS_TEACHER: (id: string) => `/api/class-arms/${id}/assign-class-teacher/`,
  UNASSIGN_CLASS_TEACHER: (id: string) => `/api/class-arms/${id}/unassign-class-teacher/`,
  // Bulk report cards for everyone currently enrolled in the arm. Needs both
  // ?academic_period_id= and ?export_format=pdf|zip — the latter has no default
  // and is deliberately NOT called `format`, which DRF reserves for content
  // negotiation and which would 404 before the view runs.
  REPORT_CARDS: (id: string) => `/api/class-arms/${id}/report-cards/`,
  // The whole arm's term on one grid. Takes ?academic_period_id=. Readable by
  // admins with view_results and by any teacher, and deliberately available
  // before the broadsheet is locked — reviewing it is what happens *before*
  // publishing, so there's no lifecycle gate in the service.
  BROADSHEET: (id: string) => `/api/class-arms/${id}/broadsheet/`,
  // What this arm officially takes. Same ClassArmSubjectOfferingSerializer the
  // flat /api/class-arm-subjects/ list returns, but this one inherits the
  // viewset's default permission (none required for a custom read action) while
  // the list demands manage_academic_structure. Verified live: the list 403s
  // for a teacher, this returns 200. Unpaginated — a plain array, no `results`.
  SUBJECTS: (id: string) => `/api/class-arms/${id}/subjects/`,
  // Same story as SUBJECTS above, one endpoint over: identical
  // SubjectAssignmentSerializer to the flat /api/subject-assignments/?class_arm=
  // list, but that list requires manage_academic_structure while this inherits
  // the viewset default and requires nothing. Verified live with a teacher
  // token — the flat list 403s, this returns 200.
  SUBJECT_ASSIGNMENTS: (id: string) => `/api/class-arms/${id}/subject-assignments/`,
  // Overall standing for the arm, by average descending. Returns [] until the
  // broadsheet is locked — summaries are only written at lock time.
  LEADERBOARD: (id: string) => `/api/class-arms/${id}/leaderboard/`,
  // Session rollover, scoped to one source arm — there is no school-wide
  // "promote everyone" call. Preview suggests a destination per student;
  // promote commits explicit ones. Both need edit_students.
  //
  // Preview takes ?target_session_id= (required) and ?source_session_id=
  // (optional — falls back to the school's current session, and 400s if there
  // isn't one). Promote requires both in the body, and they must differ.
  PROMOTE_PREVIEW: (id: string) => `/api/class-arms/${id}/promote/preview/`,
  PROMOTE: (id: string) => `/api/class-arms/${id}/promote/`,
  // Who in this arm still owes, for ?academic_period_id= (required — omitting it
  // is a 400, not a default to the current term). Requires view_fees.
  //
  // Only students with a balance above zero are returned, ordered by admission
  // number, so an empty array means the arm is fully settled rather than
  // unbilled. Roster is current enrollment for that period's session — the same
  // latest-Enrollment-row rule attendance and results use. A bare array, not
  // paginated.
  FEE_DEFAULTERS: (id: string) => `/api/class-arms/${id}/fees/defaulters/`,
} as const;

export const SUBJECT_ENDPOINTS = {
  LIST: () => `/api/subjects/`,
  DETAIL: (id: string) => `/api/subjects/${id}/`,
  // Ranks one subject by total score. Needs ?academic_period_id= plus EXACTLY
  // one of ?class_arm_id= (within that arm) or ?class_id= (across every arm
  // under the class) — sending both or neither is a 400 either way.
  LEADERBOARD: (id: string) => `/api/subjects/${id}/leaderboard/`,
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
