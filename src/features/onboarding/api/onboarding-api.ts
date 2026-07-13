import { apiClient } from "@/lib/api/client";
import { ENDPOINTS, SCHOOL_ENDPOINTS } from "@/lib/api/endpoints";
import { getOnboardingStage, type OnboardingStageResponse } from "@/lib/school/get-onboarding-stage";
import type { StepKey } from "@/lib/school/onboarding-steps";

import type {
  AcademicSessionPayload,
  AcademicSessionResponse,
  BrandingPayload,
  CreateClassesPayload,
  CreateClassesResponse,
  CreateSubjectsPayload,
  CreateSubjectsResponse,
  OnboardingReviewResponse,
  SchoolResponse,
  SubjectTemplatesResponse,
} from "../types";

// Re-exported so hooks only ever import from this one api file, per the
// project's schema/types/api/hook/UI separation convention.
export { getOnboardingStage };

export async function updateBranding(schoolId: string, payload: BrandingPayload): Promise<SchoolResponse> {
  const { data } = await apiClient.patch<SchoolResponse>(SCHOOL_ENDPOINTS.PATCH(schoolId), payload);
  return data;
}

// Token-scoped — no :id in the path.
export async function createAcademicSession(
  payload: AcademicSessionPayload,
): Promise<AcademicSessionResponse> {
  const { data } = await apiClient.post<AcademicSessionResponse>(
    ENDPOINTS.ACADEMIC_SESSIONS_WITH_PERIODS,
    payload,
  );
  return data;
}

// Token-scoped — no :id in the path.
export async function createClasses(payload: CreateClassesPayload): Promise<CreateClassesResponse> {
  const { data } = await apiClient.post<CreateClassesResponse>(ENDPOINTS.CLASSES_BULK, payload);
  return data;
}

// Token-scoped, no trailing slash.
export async function getSubjectTemplates(): Promise<SubjectTemplatesResponse> {
  const { data } = await apiClient.get<SubjectTemplatesResponse>(ENDPOINTS.SUBJECTS_TEMPLATES);
  return data;
}

// Token-scoped.
export async function createSubjects(payload: CreateSubjectsPayload): Promise<CreateSubjectsResponse> {
  const { data } = await apiClient.post<CreateSubjectsResponse>(ENDPOINTS.SUBJECTS_BULK, payload);
  return data;
}

export async function getOnboardingReview(schoolId: string): Promise<OnboardingReviewResponse> {
  const { data } = await apiClient.get<OnboardingReviewResponse>(SCHOOL_ENDPOINTS.ONBOARDING_REVIEW(schoolId));
  return data;
}

export async function advanceOnboardingStage(
  schoolId: string,
  step: StepKey,
  skipped?: boolean,
): Promise<OnboardingStageResponse> {
  const { data } = await apiClient.post<OnboardingStageResponse>(
    SCHOOL_ENDPOINTS.ONBOARDING_ADVANCE(schoolId),
    { step, ...(skipped !== undefined ? { skipped } : {}) },
  );
  return data;
}
