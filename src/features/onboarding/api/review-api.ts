import { apiClient } from "@/lib/api/client";
import {
  ACADEMIC_PERIOD_ENDPOINTS,
  ACADEMIC_SESSION_ENDPOINTS,
  CLASS_ARM_ENDPOINTS,
  CLASS_ENDPOINTS,
  SUBJECT_ENDPOINTS,
} from "@/lib/api/endpoints";

import type {
  AcademicSessionResponse,
  ArmResponse,
  ClassResponse,
  PeriodResponse,
  SubjectResponse,
} from "../types";
import type {
  AddArmPayload,
  AddPeriodPayload,
  UpdateClassPayload,
  UpdatePeriodPayload,
  UpdateSessionPayload,
  UpdateSubjectPayload,
} from "../types-review";

// Per-record edit/add/delete for the Review step. Branding edit reuses the
// existing updateBranding() in onboarding-api.ts; add-class/add-subjects reuse
// createClasses()/createSubjects() there too — both already POST one item.

export async function updateSession(id: string, payload: UpdateSessionPayload): Promise<AcademicSessionResponse> {
  const { data } = await apiClient.patch<AcademicSessionResponse>(ACADEMIC_SESSION_ENDPOINTS.DETAIL(id), payload);
  return data;
}

export async function deleteSession(id: string): Promise<void> {
  await apiClient.delete(ACADEMIC_SESSION_ENDPOINTS.DETAIL(id));
}

export async function addPeriod(sessionId: string, payload: AddPeriodPayload): Promise<PeriodResponse> {
  const { data } = await apiClient.post<PeriodResponse>(ACADEMIC_SESSION_ENDPOINTS.ADD_PERIOD(sessionId), payload);
  return data;
}

export async function updatePeriod(id: string, payload: UpdatePeriodPayload): Promise<PeriodResponse> {
  const { data } = await apiClient.patch<PeriodResponse>(ACADEMIC_PERIOD_ENDPOINTS.DETAIL(id), payload);
  return data;
}

export async function deletePeriod(id: string): Promise<void> {
  await apiClient.delete(ACADEMIC_PERIOD_ENDPOINTS.DETAIL(id));
}

export async function updateClass(id: string, payload: UpdateClassPayload): Promise<ClassResponse> {
  const { data } = await apiClient.patch<ClassResponse>(CLASS_ENDPOINTS.DETAIL(id), payload);
  return data;
}

export async function deleteClass(id: string): Promise<void> {
  await apiClient.delete(CLASS_ENDPOINTS.DETAIL(id));
}

export async function addArm(classId: string, payload: AddArmPayload): Promise<ArmResponse> {
  const { data } = await apiClient.post<ArmResponse>(CLASS_ENDPOINTS.ADD_ARM(classId), payload);
  return data;
}

export async function updateArm(id: string, payload: AddArmPayload): Promise<ArmResponse> {
  const { data } = await apiClient.patch<ArmResponse>(CLASS_ARM_ENDPOINTS.DETAIL(id), payload);
  return data;
}

export async function deleteArm(id: string): Promise<void> {
  await apiClient.delete(CLASS_ARM_ENDPOINTS.DETAIL(id));
}

export async function updateSubject(id: string, payload: UpdateSubjectPayload): Promise<SubjectResponse> {
  const { data } = await apiClient.patch<SubjectResponse>(SUBJECT_ENDPOINTS.DETAIL(id), payload);
  return data;
}

export async function deleteSubject(id: string): Promise<void> {
  await apiClient.delete(SUBJECT_ENDPOINTS.DETAIL(id));
}
