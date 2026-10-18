import type { UserMinimal } from "@/lib/api/profile-summary";
import type { StudentListItem } from "@/features/students/types";

export const ATTENDANCE_STATUSES = ["present", "absent", "late", "excused"] as const;

export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export interface AttendanceRecord {
  id: string;
  student: StudentListItem;
  class_arm: string;
  date: string;
  status: AttendanceStatus;
  note: string | null;
  marked_by: UserMinimal | null;
  marked_at: string;
  updated_at: string;
}

// One student's row in the register as the teacher currently has it — which may
// differ from what the server holds, either because it hasn't been saved yet or
// because the save is queued offline.
export interface DraftEntry {
  status: AttendanceStatus;
  note: string;
}

export interface AttendanceMarkItem {
  student_id: string;
  status: AttendanceStatus;
  note?: string;
  // Client-side time of the mark. The backend uses it for last-write-wins:
  // an incoming item whose marked_at is not newer than the stored record is
  // dropped into `skipped` rather than applied. Always send it so two devices
  // marking the same register resolve deterministically.
  marked_at: string;
}

export interface BulkMarkPayload {
  class_arm_id: string;
  // ISO date (YYYY-MM-DD), not a datetime.
  date: string;
  records: AttendanceMarkItem[];
}

export interface BulkMarkResponse {
  applied: AttendanceRecord[];
  // Populated when a record was rejected as stale — a newer mark already exists
  // for that student and date. Never an error; the request still succeeds.
  skipped: { student_id: string; reason: string }[];
}

// POST /api/attendance/bulk-clear/. cleared_at is the same last-write-wins
// clock as marked_at: a mark newer than it survives and comes back in skipped.
export interface BulkClearPayload {
  class_arm_id: string;
  date: string;
  student_ids: string[];
  cleared_at: string;
}

export interface BulkClearResponse {
  // Student ids, not records — there is nothing left to return.
  cleared: string[];
  skipped: { student_id: string; reason: string }[];
}
