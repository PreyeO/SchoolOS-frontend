import { apiClient } from "@/lib/api/client";
import {
  CLASS_ARM_ENDPOINTS,
  CLASS_ARM_SUBJECT_ENDPOINTS,
  SUBJECT_ASSIGNMENT_ENDPOINTS,
} from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/lib/api/types";

import type {
  ClassArmSubject,
  CreateClassArmSubjectPayload,
  CreateSubjectAssignmentPayload,
  SubjectAssignment,
} from "../types";

// The subjects an arm offers.
//
// Reads the class-arm detail action rather than the flat
// /api/class-arm-subjects/?class_arm= list. Identical serializer, but the list
// requires manage_academic_structure while this inherits the viewset default,
// which asks only for school membership. Confirmed live: the flat list 403s for
// a teacher and this returns 200 — which broke the broadsheet's column set (a
// teacher saw only subjects that already had scores, so the "nobody has entered
// this subject" gap the screen exists to show was invisible to them), and would
// equally have hit an admin holding view_results but not manage_academic_structure.
//
// Unpaginated, so no page_size to work around either.
export async function getArmSubjects(classArmId: string): Promise<ClassArmSubject[]> {
  const { data } = await apiClient.get<ClassArmSubject[]>(CLASS_ARM_ENDPOINTS.SUBJECTS(classArmId));
  return data;
}

// Takes an array and returns one offering per subject. All validation happens
// before any write, so a partial batch never lands.
export async function addArmSubjects(payload: CreateClassArmSubjectPayload): Promise<ClassArmSubject[]> {
  const { data } = await apiClient.post<ClassArmSubject[]>(CLASS_ARM_SUBJECT_ENDPOINTS.LIST(), payload);
  return data;
}

export async function removeArmSubject(id: string): Promise<void> {
  await apiClient.delete(CLASS_ARM_SUBJECT_ENDPOINTS.DETAIL(id));
}

// One arm's assignments across all its subjects. page_size=100 (backend max) —
// a senior arm can carry 20+ subjects and several teachers share some of them,
// and this screen has no pagination UI. The read filter is `class_arm`, not
// `class_arm_id` — it's a plain filterset_fields entry on the FK.
// Who teaches what in one arm.
//
// Reads the class-arm detail action rather than the flat
// /api/subject-assignments/?class_arm= list — the same swap already made for
// getArmSubjects, and for the same reason. Identical serializer, but the flat
// list requires manage_academic_structure while this inherits the viewset
// default and asks for nothing. Confirmed live with a teacher token: the list
// 403s, this returns 200.
//
// Only Publish Results reads this today and that screen is admin-only, so
// nothing was visibly broken — but an admin holding view_results without
// manage_academic_structure would have hit the same wall, and it's the exact
// trap that left the broadsheet's columns silently empty for teachers before
// we caught it.
//
// Unpaginated, so the page_size=100 cap is gone too.
export async function getArmAssignments(classArmId: string): Promise<SubjectAssignment[]> {
  const { data } = await apiClient.get<SubjectAssignment[]>(
    CLASS_ARM_ENDPOINTS.SUBJECT_ASSIGNMENTS(classArmId),
  );
  return data;
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

// Returns one assignment per subject in the batch.
export async function createAssignments(
  payload: CreateSubjectAssignmentPayload,
): Promise<SubjectAssignment[]> {
  const { data } = await apiClient.post<SubjectAssignment[]>(
    SUBJECT_ASSIGNMENT_ENDPOINTS.LIST(),
    payload,
  );
  return data;
}

export async function deleteAssignment(id: string): Promise<void> {
  await apiClient.delete(SUBJECT_ASSIGNMENT_ENDPOINTS.DETAIL(id));
}
