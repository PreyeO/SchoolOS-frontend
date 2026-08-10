import { apiClient } from "@/lib/api/client";
import { STUDENT_ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/lib/api/types";

import type { EnrollmentRecord, StudentDetail, StudentFilters, StudentListItem } from "../types";

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

export async function reissueStudentPassword(id: string, password: string): Promise<void> {
  await apiClient.post(STUDENT_ENDPOINTS.REISSUE_PASSWORD(id), { password });
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
