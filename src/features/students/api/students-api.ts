import { apiClient } from "@/lib/api/client";
import { STUDENT_ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/lib/api/types";

import type {
  BulkStatusUpdatePayload,
  BulkStatusUpdateResult,
  EnrollmentRecord,
  StudentDetail,
  StudentFilters,
  StudentListItem,
} from "../types";

export async function getStudents(filters: StudentFilters): Promise<PaginatedResponse<StudentListItem>> {
  const { data } = await apiClient.get<PaginatedResponse<StudentListItem>>(STUDENT_ENDPOINTS.LIST(), {
    params: filters,
  });
  return data;
}

export async function getStudentDetail(id: string): Promise<StudentDetail> {
  const { data } = await apiClient.get<StudentDetail>(STUDENT_ENDPOINTS.DETAIL(id));
  return data;
}

// Edits the whitelisted profile fields. PATCH, so only what's sent changes —
// which is what lets the detail page offer one Edit per card instead of a single
// eighteen-field form.
//
// Gated on CanEditStudentProfile: admins with edit_students, OR any teacher.
// The teacher branch is deliberate — a teacher may need to record a medical note
// for a student they don't formally teach — so don't gate the UI on the
// permission string alone.
//
// admission_number is NOT editable and isn't in the whitelist; it's the
// student's identity across the school.
export async function updateStudent(
  id: string,
  payload: Record<string, unknown>,
): Promise<StudentDetail> {
  const { data } = await apiClient.patch<StudentDetail>(STUDENT_ENDPOINTS.DETAIL(id), payload);
  return data;
}

export async function reissueStudentPassword(id: string, password: string): Promise<void> {
  await apiClient.post(STUDENT_ENDPOINTS.REISSUE_PASSWORD(id), { password });
}

// The only route that changes enrollment_status — the profile PATCH above
// silently drops it. edit_students. All-or-nothing: one bad id or illegal move
// and the whole batch 400s with nothing written.
export async function bulkUpdateStudentStatus(payload: BulkStatusUpdatePayload): Promise<BulkStatusUpdateResult> {
  const { data } = await apiClient.post<BulkStatusUpdateResult>(STUDENT_ENDPOINTS.BULK_UPDATE_STATUS(), payload);
  return data;
}

export async function updateStudentName(
  id: string,
  payload: { first_name: string; last_name: string },
): Promise<StudentDetail> {
  const { data } = await apiClient.patch<StudentDetail>(STUDENT_ENDPOINTS.UPDATE_NAME(id), payload);
  return data;
}

// Only for a profile created in error. 400s if the student has any history
// (scores, attendance, notes, fees, a second enrollment…) — the answer then is
// a terminal status, not a delete.
export async function deleteStudent(id: string): Promise<void> {
  await apiClient.delete(STUDENT_ENDPOINTS.DETAIL(id));
}

// Places the student in a class arm for the current session. The same call
// covers first placement, a mid-session transfer and a promotion — the backend
// records a new row either way rather than mutating the old one.
export async function enrollStudent(id: string, classArmId: string): Promise<EnrollmentRecord> {
  const { data } = await apiClient.post<EnrollmentRecord>(STUDENT_ENDPOINTS.ENROLL(id), {
    class_arm_id: classArmId,
  });
  return data;
}

// Every row, all sessions, newest first — transfers included, not collapsed.
// A bare array, not a paginated envelope.
export async function getEnrollmentHistory(id: string): Promise<EnrollmentRecord[]> {
  const { data } = await apiClient.get<EnrollmentRecord[]>(STUDENT_ENDPOINTS.ENROLLMENT_HISTORY(id));
  return data;
}
