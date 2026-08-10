import { apiClient } from "@/lib/api/client";
import { ATTENDANCE_ENDPOINTS, STUDENT_ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/lib/api/types";
import type { StudentListItem } from "@/features/students/types";

import type { AttendanceRecord, BulkMarkPayload, BulkMarkResponse } from "../types";

// The register's roster. page_size=100 (backend max) covers any realistic arm —
// a class of more than 100 would need paging here, which a register shouldn't
// have, so getRoster reports the overflow rather than silently truncating.
export async function getRoster(
  classArmId: string,
): Promise<{ students: StudentListItem[]; total: number }> {
  const { data } = await apiClient.get<PaginatedResponse<StudentListItem>>(STUDENT_ENDPOINTS.LIST(), {
    params: { class_arm_id: classArmId, is_active: true, page_size: 100 },
  });
  return { students: data.results, total: data.count };
}

// Existing marks for one arm on one date. Empty on a day nobody has marked yet,
// which is the normal morning case — the roster is what seeds the register, not
// this.
export async function getAttendance(classArmId: string, date: string): Promise<AttendanceRecord[]> {
  const { data } = await apiClient.get<PaginatedResponse<AttendanceRecord>>(ATTENDANCE_ENDPOINTS.LIST(), {
    params: { class_arm_id: classArmId, date, page_size: 100 },
  });
  return data.results;
}

export async function bulkMarkAttendance(payload: BulkMarkPayload): Promise<BulkMarkResponse> {
  const { data } = await apiClient.post<BulkMarkResponse>(ATTENDANCE_ENDPOINTS.BULK_MARK(), payload);
  return data;
}
