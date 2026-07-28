import { apiClient } from "@/lib/api/client";
import { STUDENT_ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/lib/api/types";

import type { StudentDetail, StudentFilters, StudentListItem } from "../types";

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
