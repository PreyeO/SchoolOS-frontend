import type { StepKey } from "@/lib/school/onboarding-steps";
import type { OnboardingStageResponse } from "@/lib/school/get-onboarding-stage";

export type { StepKey, OnboardingStageResponse };

// --- Branding (PATCH /api/schools/:id/) ------------------------------------
// Only these four fields are editable in onboarding; the rest of the school
// profile was set at create-school and is edited later in dashboard Settings.
export interface BrandingPayload {
  logo?: string;
  primary_color: string;
  accent_color: string;
  motto?: string;
}

// The PATCH response is the full school object; we only read these fields.
export interface SchoolResponse {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  primary_color: string;
  accent_color: string;
  motto: string | null;
}

// --- Academic session (POST /api/academic-sessions/with-periods/) ---------
export interface PeriodPayload {
  name: string;
  order: number;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

export interface PeriodResponse extends PeriodPayload {
  id: string;
}

export interface AcademicSessionPayload {
  name: string;
  periods: PeriodPayload[];
}

export interface AcademicSessionResponse {
  id: string;
  name: string;
  periods: PeriodResponse[];
}

// --- Classes (POST /api/classes/bulk/) -------------------------------------
export interface ArmPayload {
  name: string;
}

export interface ArmResponse extends ArmPayload {
  id: string;
}

export interface ClassPayload {
  name: string;
  level: string;
  arms: ArmPayload[];
}

export interface ClassResponse {
  id: string;
  name: string;
  level: string;
  arms: ArmResponse[];
}

export interface CreateClassesPayload {
  classes: ClassPayload[];
}

// ⚠️ Envelope assumed to mirror the request shape — the prompt only specifies
// "created classes (ids, order, arm ids)", not the exact wrapper key.
export interface CreateClassesResponse {
  classes: ClassResponse[];
}

// --- Subjects (GET /api/subjects/templates, POST /api/subjects/bulk/) -----
export interface SubjectTemplateItem {
  name: string;
  is_core: boolean;
}

export interface SubjectTemplatesResponse {
  primary?: SubjectTemplateItem[];
  junior_secondary?: SubjectTemplateItem[];
  senior_secondary?: SubjectTemplateItem[];
}

export interface SubjectPayload {
  name: string;
  level: string;
  is_core: boolean;
}

export interface SubjectResponse extends SubjectPayload {
  id: string;
}

export interface CreateSubjectsPayload {
  subjects: SubjectPayload[];
}

// ⚠️ Envelope assumed to mirror the request shape, same caveat as classes.
export interface CreateSubjectsResponse {
  subjects: SubjectResponse[];
}

// --- Review (GET /api/schools/:id/onboarding/review) -----------------------
export interface OnboardingReviewResponse {
  school: SchoolResponse;
  academic_sessions: AcademicSessionResponse[];
  classes: ClassResponse[];
  subjects: SubjectResponse[];
}

// --- Advance (POST /api/schools/:id/onboarding/advance/) -------------------
export interface AdvanceStagePayload {
  step: StepKey;
  skipped?: boolean;
}

// Kept for the dashboard's local setup checklist (features/dashboard) — tracks
// per-session step completion client-side, separate from the real backend
// onboarding stage which now drives the wizard itself.
export interface SetupStatusResponse {
  branding: boolean;
  academic_year: boolean;
  classes: boolean;
  subjects: boolean;
}
