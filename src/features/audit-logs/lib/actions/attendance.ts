import type { ActionMeta } from "../action-catalog-data";

// Attendance.
// Grouped by the backend app that emits the action, which is the seam the
// action strings themselves already follow.
export const ATTENDANCE_ACTIONS: Record<string, ActionMeta> = {
  "attendance.marked": { category: "attendance", rest: (t) => `marked attendance — ${t}` },
  "attendance.updated": { category: "attendance", rest: (t) => `changed an attendance mark — ${t}` },

};
