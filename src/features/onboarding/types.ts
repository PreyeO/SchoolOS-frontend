export interface BrandingPayload {
  primary_color: string;
  logo?: File | null;
}

export interface BrandingResponse {
  primary_color: string;
  logo_url: string | null;
}

export type TermCode = "FIRST" | "SECOND" | "THIRD";

export interface SessionTermPayload {
  name: TermCode;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

export interface AcademicSessionPayload {
  name: string;
  is_current: boolean;
  terms: SessionTermPayload[];
}

export interface AcademicSessionResponse {
  id: string;
  name: string;
  is_current: boolean;
  terms: (SessionTermPayload & { id: string })[];
}

export interface ClassRow {
  name: string;
  arm: string;
  // Per-arm capacity is set later in dashboard classes management, not onboarding.
}

export interface CreateClassesPayload {
  classes: ClassRow[];
}

export interface CreateClassesResponse {
  count: number;
}

export interface SubjectPayload {
  name: string;
  level: string;
  is_core: boolean;
}

export interface CreateSubjectsPayload {
  subjects: SubjectPayload[];
}

export interface CreateSubjectsResponse {
  count: number;
}

export interface CompleteOnboardingResponse {
  success: boolean;
}

export interface SetupStatusResponse {
  branding: boolean;
  academic_year: boolean;
  classes: boolean;
  subjects: boolean;
}
