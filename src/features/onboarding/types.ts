export interface BrandingPayload {
  primary_color: string;
  logo?: File | null;
}

export interface BrandingResponse {
  primary_color: string;
  logo_url: string | null;
}

export interface AcademicSessionPayload {
  name: string;
  start_date: string;
  end_date: string;
  term_count: 2 | 3;
}

export interface AcademicSessionResponse {
  id: string;
  name: string;
  term_count: 2 | 3;
}

export interface ClassRow {
  name: string;
  section: string;
  max_students: number;
}

export interface CreateClassesPayload {
  classes: ClassRow[];
}

export interface CreateClassesResponse {
  count: number;
}

export interface CreateSubjectsPayload {
  subjects: string[];
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
