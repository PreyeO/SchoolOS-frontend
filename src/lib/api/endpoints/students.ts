// Split from people.ts (2026-10-10) when the student lifecycle routes pushed it
// past 150 lines. Re-exported from ../endpoints like every other domain file.
// Trailing slashes are preserved exactly as the backend defines them.

export const STUDENT_ENDPOINTS = {
  LIST: () => `/api/students/`,
  // GET, PATCH (profile whitelist — no longer accepts enrollment_status), and
  // DELETE (delete_students; 400s unless the profile has no history at all).
  DETAIL: (id: string) => `/api/students/${id}/`,
  REISSUE_PASSWORD: (id: string) => `/api/students/${id}/reissue-password/`,
  // The only way to change enrollment_status. edit_students; one status + one
  // reason per batch; all-or-nothing — any bad id or illegal move 400s the lot.
  BULK_UPDATE_STATUS: () => `/api/students/bulk-update-status/`,
  // PATCH first_name and/or last_name. edit_students. A data-entry fix, kept
  // apart from the profile PATCH because a teacher can reach that one.
  UPDATE_NAME: (id: string) => `/api/students/${id}/update-name/`,
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
