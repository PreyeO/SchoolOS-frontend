import { apiClient } from "@/lib/api/client";
import {
  CLASS_ARM_SUBJECT_ENDPOINTS,
  STUDENT_ENDPOINTS,
  SUBJECT_ASSIGNMENT_ENDPOINTS,
  TEACHER_ENDPOINTS,
} from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/lib/api/types";

// The setup guide only needs "has this started?", so each of these asks for a
// single row and reads `count` off the envelope. Both list endpoints scope their
// queryset to the caller's school, so unfiltered gives a school-wide total —
// confirmed against the running backend.
async function countOf(url: string): Promise<number> {
  const { data } = await apiClient.get<PaginatedResponse<unknown>>(url, {
    params: { page_size: 1 },
  });
  return data.count;
}

export interface SetupCounts {
  teachers: number;
  students: number;
  classSubjects: number;
  subjectTeachers: number;
}

export async function getSetupCounts(): Promise<SetupCounts> {
  const [teachers, students, classSubjects, subjectTeachers] = await Promise.all([
    countOf(TEACHER_ENDPOINTS.LIST()),
    countOf(STUDENT_ENDPOINTS.LIST()),
    countOf(CLASS_ARM_SUBJECT_ENDPOINTS.LIST()),
    countOf(SUBJECT_ASSIGNMENT_ENDPOINTS.LIST()),
  ]);
  return { teachers, students, classSubjects, subjectTeachers };
}
