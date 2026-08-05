export interface SignupPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  confirm_password: string;
  phone_number?: string;
}

export interface SignupResponse {
  detail: string;
}

export type ApiErrorDetail = string | string[];

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  detail: string;
  state: string;
  access: string;
  refresh: string;
}

export interface ResendOtpPayload {
  email: string;
}

export interface ResendOtpResponse {
  detail: string;
}

export type SchoolLevel =
  | "creche"
  | "nursery"
  | "primary"
  | "junior_secondary"
  | "senior_secondary";

export type SchoolType = "nursery" | "primary" | "secondary" | "combined";

export interface CreateSchoolPayload {
  name: string;
  slug: string;
  school_type: SchoolType;
  levels: SchoolLevel[];
  state: string;
  city: string;
  address: string;
  phone_number: string;
  email: string;
  student_capacity: number;
}

export interface CreateSchoolResponse {
  requires_school_selection: boolean;
  state: string;
  access?: string;
  refresh?: string;
}

export interface LoginPayload {
  identifier: string;
  password: string;
  school_slug?: string;
}

// GET /api/schools/search/ — matches SchoolSearchResultSerializer exactly.
// city/state are returned precisely so a near-duplicate can be told apart from
// the real thing (many Nigerian schools share a name across states).
export interface SchoolSearchResult {
  id: string;
  name: string;
  slug: string;
  city: string;
  state: string;
}

export interface SchoolSummary {
  name: string;
  slug: string;
  subdomain: string;
}

// Scoped: tokens returned, no selection needed.
export interface LoginScopedResponse {
  requires_school_selection: false;
  state: string;
  access: string;
  refresh: string;
}

// Selection needed: no tokens; caller re-logs-in with a chosen school_slug.
export interface LoginSelectionResponse {
  requires_school_selection: true;
  state: string;
  schools: SchoolSummary[];
}

export type LoginResponse = LoginScopedResponse | LoginSelectionResponse;

export interface PasswordResetRequestResponse {
  detail: string;
}

// email is compared server-side too via confirm_password — sent even though
// client-side validation already caught a mismatch, since the backend is the
// authoritative check (accounts.serializers.PasswordResetConfirmSerializer).
export interface PasswordResetConfirmPayload {
  email: string;
  otp: string;
  password: string;
  confirm_password: string;
}

export interface PasswordResetConfirmResponse {
  detail: string;
}
