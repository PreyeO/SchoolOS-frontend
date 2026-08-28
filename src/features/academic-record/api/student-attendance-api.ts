import { apiClient } from "@/lib/api/client";
import { ATTENDANCE_ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/lib/api/types";
import type { AttendanceRecord } from "@/features/attendance/types";

// One student's own attendance, for the parent and student portals.
//
// Distinct from features/attendance's getAttendance, which is arm-scoped and
// serves the teacher's register. Same endpoint, different question: "was my
// child in school" rather than "who is in today".
//
// page_size=100 with no pagination UI — a term is at most ~65 school days, so
// one page covers a term comfortably. A full session would exceed it, which is
// why the screen filters by term rather than showing everything.
export async function getStudentAttendance(
  studentId: string,
  range?: { after?: string; before?: string },
): Promise<AttendanceRecord[]> {
  const { data } = await apiClient.get<PaginatedResponse<AttendanceRecord>>(
    ATTENDANCE_ENDPOINTS.LIST(),
    {
      params: {
        student: studentId,
        page_size: 100,
        ...(range?.after ? { date_after: range.after } : {}),
        ...(range?.before ? { date_before: range.before } : {}),
      },
    },
  );
  return data.results;
}
