import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import { deriveSchoolType, sortLevels } from "@/lib/school/derive-school-type";

import type { CreateSchoolFormValues } from "../schemas/create-school-schema";
import type { SignupFormValues } from "../schemas/signup-schema";
import type { VerifyOtpFormValues } from "../schemas/verify-otp-schema";
import type {
  CreateSchoolPayload,
  CreateSchoolResponse,
  CurrentSchoolInfo,
  LoginPayload,
  LoginResponse,
  ResendOtpPayload,
  ResendOtpResponse,
  SchoolLevel,
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

export async function getCurrentSchool(): Promise<CurrentSchoolInfo> {
  // TODO confirm: the endpoint that returns the token-scoped current school.
  // Reusing the school endpoint (GET) for now; swap when the real one is confirmed.
  const { data } = await apiClient.get<CurrentSchoolInfo>(ENDPOINTS.SCHOOL);
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
