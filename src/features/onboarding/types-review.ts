// Request payload types for the editable Review step (Phase 4.2). Response
// shapes are already covered by types.ts (AcademicSessionResponse,
// PeriodResponse, ClassResponse, ArmResponse, SubjectResponse) — every
// edit/add/delete endpoint here returns one of those, just via PATCH/POST/DELETE
// instead of the bulk-create paths.

export interface UpdateSessionPayload {
  name: string;
}

export interface UpdatePeriodPayload {
  name?: string;
  start_date?: string;
  end_date?: string;
  is_current?: boolean;
}

// order is auto-assigned client-side (max existing order in the session + 1) —
// same convention as academic_year's onboarding step; never user-facing.
export interface AddPeriodPayload {
  name: string;
  order: number;
  start_date: string;
  end_date: string;
  is_current?: boolean;
}

// level is deliberately absent — not editable post-creation (see academic/
// services.py AcademicService.update_class docstring).
export interface UpdateClassPayload {
  name: string;
}

export interface AddArmPayload {
  name: string;
}

export interface UpdateSubjectPayload {
  name?: string;
  level?: string;
  is_core?: boolean;
}
