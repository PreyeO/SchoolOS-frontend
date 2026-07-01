// MOCK — replace all functions with real API calls when endpoints are ready.
// Each function adds a 600ms delay to simulate network latency.

import type {
  AcademicSessionPayload,
  AcademicSessionResponse,
  BrandingPayload,
  BrandingResponse,
  CompleteOnboardingResponse,
  CreateClassesPayload,
  CreateClassesResponse,
  CreateSubjectsPayload,
  CreateSubjectsResponse,
  SetupStatusResponse,
} from "../types";

function delay(ms = 600): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function updateBranding(payload: BrandingPayload): Promise<BrandingResponse> {
  await delay();
  const logoUrl = payload.logo ? URL.createObjectURL(payload.logo) : null;
  return { primary_color: payload.primary_color, logo_url: logoUrl };
}

export async function createSession(
  payload: AcademicSessionPayload,
): Promise<AcademicSessionResponse> {
  await delay();
  return {
    id: `sess_${Date.now()}`,
    name: payload.name,
    term_count: payload.term_count,
  };
}

export async function createClasses(
  payload: CreateClassesPayload,
): Promise<CreateClassesResponse> {
  await delay();
  return { count: payload.classes.length };
}

export async function createSubjects(
  payload: CreateSubjectsPayload,
): Promise<CreateSubjectsResponse> {
  await delay();
  return { count: payload.subjects.length };
}

export async function completeOnboarding(): Promise<CompleteOnboardingResponse> {
  await delay();
  return { success: true };
}

export async function getSetupStatus(): Promise<SetupStatusResponse> {
  await delay(200);
  return { branding: false, academic_year: false, classes: false, subjects: false };
}
