import { apiClient } from "@/lib/api/client";
import { TEACHER_ENDPOINTS } from "@/lib/api/endpoints";
import type { MembershipSummary } from "@/lib/api/profile-summary";
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

// edit_staff. Unassigns every class and subject they hold, then deletes the
// teacher profile — this id 404s afterwards.
export async function offboardTeacher(id: string, reason: string): Promise<MembershipSummary> {
  const { data } = await apiClient.post<MembershipSummary>(TEACHER_ENDPOINTS.OFFBOARD(id), { reason });
  return data;
}
