import { apiClient } from "@/lib/api/client";
import { SUBJECT_ASSIGNMENT_ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/lib/api/types";

import type { CreateSubjectAssignmentPayload, SubjectAssignment } from "../types";

// One arm's assignments across all its subjects. page_size=100 (backend max) —
// a senior arm can carry 20+ subjects and several teachers share some of them,
// and this screen has no pagination UI. The read filter is `class_arm`, not
// `class_arm_id` — it's a plain filterset_fields entry on the FK.
export async function getArmAssignments(classArmId: string): Promise<SubjectAssignment[]> {
  const { data } = await apiClient.get<PaginatedResponse<SubjectAssignment>>(
    SUBJECT_ASSIGNMENT_ENDPOINTS.LIST(),
    { params: { class_arm: classArmId, page_size: 100 } },
  );
  return data.results;
}

// Everything one teacher teaches, across every arm. Same endpoint, `teacher`
// filter instead of `class_arm` — needs manage_academic_structure, unlike MINE.
export async function getTeacherAssignments(teacherProfileId: string): Promise<SubjectAssignment[]> {
  const { data } = await apiClient.get<PaginatedResponse<SubjectAssignment>>(
    SUBJECT_ASSIGNMENT_ENDPOINTS.LIST(),
    { params: { teacher: teacherProfileId, page_size: 100 } },
  );
  return data.results;
}

// The caller's own assignments — the endpoint a teacher-facing screen uses, since
// it needs no manage_academic_structure permission. Returns a bare array, not a
// paginated envelope. 400s for a user with no teacher profile, so only call it
// for someone known to be a teacher.
export async function getMyAssignments(): Promise<SubjectAssignment[]> {
  const { data } = await apiClient.get<SubjectAssignment[]>(SUBJECT_ASSIGNMENT_ENDPOINTS.MINE());
  return data;
}

export async function createAssignment(
  payload: CreateSubjectAssignmentPayload,
): Promise<SubjectAssignment> {
  const { data } = await apiClient.post<SubjectAssignment>(SUBJECT_ASSIGNMENT_ENDPOINTS.LIST(), payload);
  return data;
}

export async function deleteAssignment(id: string): Promise<void> {
  await apiClient.delete(SUBJECT_ASSIGNMENT_ENDPOINTS.DETAIL(id));
}
