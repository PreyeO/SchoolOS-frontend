import type { ActionMeta } from "../action-catalog-data";

// Attendance.
// Grouped by the backend app that emits the action, which is the seam the
// action strings themselves already follow.
export const ATTENDANCE_ACTIONS: Record<string, ActionMeta> = {
  "attendance.marked": { category: "attendance", rest: (t) => `marked attendance — ${t}` },
  "attendance.updated": { category: "attendance", rest: (t) => `changed an attendance mark — ${t}` },
  // "Unmark all" (bulk-clear). Repr: "First Last - ADM - YYYY-MM-DD (status)",
  // one row per mark actually deleted.
  "attendance.cleared": { category: "attendance", rest: (t) => `unmarked attendance — ${t}` },

};
