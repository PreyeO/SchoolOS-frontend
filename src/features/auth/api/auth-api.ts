import { apiClient } from "@/lib/api/client";
import { ENDPOINTS, SCHOOL_ENDPOINTS } from "@/lib/api/endpoints";
import { deriveSchoolType, sortLevels } from "@/lib/school/derive-school-type";

import type { CreateSchoolFormValues } from "../schemas/create-school-schema";
import type { SignupFormValues } from "../schemas/signup-schema";
import type { VerifyOtpFormValues } from "../schemas/verify-otp-schema";
import type {
  CreateSchoolPayload,
  CreateSchoolResponse,
  LoginPayload,
  LoginResponse,
  LoginScopedResponse,
  PasswordResetConfirmPayload,
  PasswordResetConfirmResponse,
  PasswordResetRequestResponse,
  ResendOtpPayload,
  ResendOtpResponse,
  SchoolLevel,
  SchoolSearchResult,
  SignupPayload,
  SignupResponse,
  VerifyOtpPayload,
  VerifyOtpResponse,
} from "../types";

export async function signup(values: SignupFormValues): Promise<SignupResponse> {
  const payload: SignupPayload = {
    first_name: values.first_name,
    last_name: values.last_name,
    email: values.email,
    password: values.password,
    confirm_password: values.confirm_password,
    ...(values.phone_number?.trim() ? { phone_number: values.phone_number } : {}),
  };
  const { data } = await apiClient.post<SignupResponse>(ENDPOINTS.USERS, payload);
  return data;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  // TODO confirm: multi-school selection is resolved by re-POSTing login with
  // `school_slug` set to the chosen school (vs a dedicated select-school endpoint).
  // If a dedicated endpoint exists, only this function changes.
  const { data } = await apiClient.post<LoginResponse>(ENDPOINTS.LOGIN, payload);
  return data;
}

export async function verifyEmail(
  values: VerifyOtpFormValues & { email: string }
): Promise<VerifyOtpResponse> {
  const payload: VerifyOtpPayload = { email: values.email, otp: values.otp };
  const { data } = await apiClient.post<VerifyOtpResponse>(ENDPOINTS.VERIFY_EMAIL, payload);
  return data;
}

export async function resendOtp(email: string): Promise<ResendOtpResponse> {
  const payload: ResendOtpPayload = { email };
  const { data } = await apiClient.post<ResendOtpResponse>(ENDPOINTS.RESEND_OTP, payload);
  return data;
}

// Always returns 200 with a generic message — never leaks whether the email
// exists or is eligible (synthetic student emails have no self-serve reset).
export async function requestPasswordReset(email: string): Promise<PasswordResetRequestResponse> {
  const { data } = await apiClient.post<PasswordResetRequestResponse>(ENDPOINTS.PASSWORD_RESET_REQUEST, { email });
  return data;
}

// No token pair on success — the backend expects the frontend to route back to /login.
export async function confirmPasswordReset(
  payload: PasswordResetConfirmPayload,
): Promise<PasswordResetConfirmResponse> {
  const { data } = await apiClient.post<PasswordResetConfirmResponse>(ENDPOINTS.PASSWORD_RESET_CONFIRM, payload);
  return data;
}

// Response is identical to login's scoped shape (both built from the same
// backend _token_pair_dict helper) — confirmed live with a two-school test
// account. Requires only IsAuthenticated, not IsSchoolMember, so it works
// from any of the user's own schools (or an unscoped token).
export async function switchSchool(schoolSlug: string): Promise<LoginScopedResponse> {
  const { data } = await apiClient.post<LoginScopedResponse>(ENDPOINTS.SWITCH_SCHOOL, { school_slug: schoolSlug });
  return data;
}

// Returns a bare array (no pagination envelope) — confirmed live. The backend
// rejects q shorter than 2 characters, so callers must gate on that.
export async function searchSchools(q: string): Promise<SchoolSearchResult[]> {
  const { data } = await apiClient.get<SchoolSearchResult[]>(SCHOOL_ENDPOINTS.SEARCH(), { params: { q } });
  return data;
}

export async function createSchool(
  values: CreateSchoolFormValues
): Promise<CreateSchoolResponse> {
  const levels = sortLevels(values.levels as SchoolLevel[]);
  const payload: CreateSchoolPayload = {
    name: values.name,
    slug: values.slug,
    school_type: deriveSchoolType(levels),
    levels,
    state: values.state,
    city: values.city,
    address: values.address,
    phone_number: values.phone_number,
    email: values.email,
    student_capacity: Number(values.student_capacity),
  };
  const { data } = await apiClient.post<CreateSchoolResponse>(ENDPOINTS.SCHOOL, payload);
  return data;
}
