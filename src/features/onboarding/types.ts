import type { StepKey } from "@/lib/school/onboarding-steps";
import type { OnboardingStageResponse } from "@/lib/school/get-onboarding-stage";
import type { ClassArmRecord, ClassRecord } from "@/lib/school/class-record";
import type { SchoolLevelValue } from "@/data/school-levels";

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

// The GET/PATCH response is the full school object; we only read these fields.
// `levels` is the reliable source for filtering onboarding prefills — the
// school-list endpoint's summary omits it.
export interface SchoolResponse {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  primary_color: string;
  accent_color: string;
  motto: string | null;
  levels: SchoolLevelValue[];
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

// --- Classes (GET /api/classes/templates, POST /api/classes/bulk/) --------
export interface ClassTemplateItem {
  name: string;
  order: number;
}

export interface ClassTemplatesResponse {
  primary?: ClassTemplateItem[];
  junior_secondary?: ClassTemplateItem[];
  senior_secondary?: ClassTemplateItem[];
}

// Request-only shape: just a name, no id/order/capacity — the backend assigns those.
export interface ArmPayload {
  name: string;
}

export type ArmResponse = ClassArmRecord;

export interface ClassPayload {
  name: string;
  level: string;
  // Optional — omitted entirely (not sent as []) for a class with no arms.
  arms?: ArmPayload[];
}

export type ClassResponse = ClassRecord;

export interface CreateClassesPayload {
  classes: ClassPayload[];
}

// Confirmed: the backend returns a bare array of created classes (id, name,
// level, order, arms — each arm with id + name), not a { classes: [...] } envelope.
export type CreateClassesResponse = ClassResponse[];

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
