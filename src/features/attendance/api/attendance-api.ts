import { apiClient } from "@/lib/api/client";
import { ATTENDANCE_ENDPOINTS, STUDENT_ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/lib/api/types";
import type { StudentListItem } from "@/features/students/types";

import type {
  AttendanceRecord,
  BulkClearPayload,
  BulkClearResponse,
  BulkMarkPayload,
  BulkMarkResponse,
} from "../types";

// The register's roster. page_size=100 (backend max) covers any realistic arm —
// a class of more than 100 would need paging here, which a register shouldn't
// have, so getRoster reports the overflow rather than silently truncating.
//
// academicPeriodId is optional and, deliberately, not passed by attendance:
// omitted, the backend resolves the roster from the CURRENT session, which is
// exactly right for a register (today's arm, today's students) and for the
// plain student directory. A caller showing a PAST term instead — Publish
// Results, a historical submission's score grid — has to pass it, or the
// backend hands back who's in the arm TODAY rather than who was there for the
// term actually being shown: a student promoted out since then goes missing
// from the old arm's list and turns up, wrongly, in the new one's.
export async function getRoster(
  classArmId: string,
  academicPeriodId?: string,
): Promise<{ students: StudentListItem[]; total: number }> {
  const { data } = await apiClient.get<PaginatedResponse<StudentListItem>>(STUDENT_ENDPOINTS.LIST(), {
    params: {
      class_arm_id: classArmId,
      is_active: true,
      page_size: 100,
      ...(academicPeriodId ? { academic_period_id: academicPeriodId } : {}),
    },
  });
  return { students: data.results, total: data.count };
}

// Existing marks for one arm. With a date, that day's register — empty on a day
// nobody has marked yet, which is the normal morning case (the roster is what
// seeds the register, not this). Without one, the arm's recent history, newest
// first, which is what the teacher home derives its trend and counts from.
export async function getAttendance(classArmId: string, date?: string): Promise<AttendanceRecord[]> {
  const { data } = await apiClient.get<PaginatedResponse<AttendanceRecord>>(ATTENDANCE_ENDPOINTS.LIST(), {
    params: { class_arm_id: classArmId, page_size: 100, ...(date ? { date } : {}) },
  });
  return data.results;
}

export async function bulkMarkAttendance(payload: BulkMarkPayload): Promise<BulkMarkResponse> {
  const { data } = await apiClient.post<BulkMarkResponse>(ATTENDANCE_ENDPOINTS.BULK_MARK(), payload);
  return data;
}

export async function bulkClearAttendance(payload: BulkClearPayload): Promise<BulkClearResponse> {
  const { data } = await apiClient.post<BulkClearResponse>(ATTENDANCE_ENDPOINTS.BULK_CLEAR(), payload);
  return data;
}
