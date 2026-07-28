import { apiClient } from "@/lib/api/client";
import { TEACHER_ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/lib/api/types";

import type { TeacherDetail, TeacherFilters, TeacherListItem } from "../types";

// Full envelope (not unwrapped) — unlike the bounded Settings lists, this
// needs `count` for real page navigation.
export async function getTeachers(filters: TeacherFilters): Promise<PaginatedResponse<TeacherListItem>> {
  const { data } = await apiClient.get<PaginatedResponse<TeacherListItem>>(TEACHER_ENDPOINTS.LIST(), {
    params: filters,
  });
  return data;
}

export async function getTeacherDetail(id: string): Promise<TeacherDetail> {
  const { data } = await apiClient.get<TeacherDetail>(TEACHER_ENDPOINTS.DETAIL(id));
  return data;
}
