import { apiClient } from "@/lib/api/client";
import { ENDPOINTS, INVITE_ENDPOINTS, ROLE_ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/lib/api/types";

import type { InviteAdminFormValues } from "../schemas/invite-admin-schema";
import type { InviteTeacherFormValues } from "../schemas/invite-teacher-schema";
import type { InviteParentFormValues } from "../schemas/invite-parent-schema";
import type { AddStudentFormValues } from "../schemas/add-student-schema";
import type {
  AcceptInvitePayload,
  AddStudentPayload,
  DetailResponse,
  InviteAdminPayload,
  InviteDetailResponse,
  InviteParentPayload,
  InviteTeacherPayload,
  PendingInvite,
  PendingInvitesFilters,
  Role,
  RolesListResponse,
  StudentCreatedResponse,
} from "../types";
import type { LoginScopedResponse } from "@/features/auth/types";

export async function inviteAdmin(values: InviteAdminFormValues): Promise<DetailResponse> {
  const payload: InviteAdminPayload = {
    first_name: values.first_name,
    last_name: values.last_name,
    email: values.email,
    role_id: values.role_id,
    ...(values.phone_number?.trim() ? { phone_number: values.phone_number } : {}),
  };
  const { data } = await apiClient.post<DetailResponse>(ENDPOINTS.INVITE_ADMIN, payload);
  return data;
}

export async function inviteTeacher(values: InviteTeacherFormValues): Promise<DetailResponse> {
  const payload: InviteTeacherPayload = {
    first_name: values.first_name,
    last_name: values.last_name,
    email: values.email,
    teacher_type: values.teacher_type,
    ...(values.phone_number?.trim() ? { phone_number: values.phone_number } : {}),
  };
  const { data } = await apiClient.post<DetailResponse>(ENDPOINTS.INVITE_TEACHER, payload);
  return data;
}

export async function inviteParent(values: InviteParentFormValues): Promise<DetailResponse> {
  const payload: InviteParentPayload = {
    first_name: values.first_name,
    last_name: values.last_name,
    email: values.email,
    ...(values.phone_number?.trim() ? { phone_number: values.phone_number } : {}),
  };
  const { data } = await apiClient.post<DetailResponse>(ENDPOINTS.INVITE_PARENT, payload);
  return data;
}

export async function addStudent(values: AddStudentFormValues): Promise<StudentCreatedResponse> {
  const payload: AddStudentPayload = {
    first_name: values.first_name,
    last_name: values.last_name,
    admission_number: values.admission_number,
    password: values.password,
    gender: values.gender,
    class_arm_id: values.class_arm_id,
    ...(values.date_of_birth?.trim() ? { date_of_birth: values.date_of_birth } : {}),
    ...(values.email?.trim() ? { email: values.email } : {}),
  };
  const { data } = await apiClient.post<StudentCreatedResponse>(ENDPOINTS.INVITE_STUDENT, payload);
  return data;
}

export async function getRoles(): Promise<Role[]> {
  const { data } = await apiClient.get<RolesListResponse>(ROLE_ENDPOINTS.LIST());
  return data.results;
}

// page_size=100 (backend max) — no pagination UI here; a school actively
// managing invites is expected to stay well under that in practice.
export async function getPendingInvites(filters: PendingInvitesFilters): Promise<PendingInvite[]> {
  const { data } = await apiClient.get<PaginatedResponse<PendingInvite>>(INVITE_ENDPOINTS.LIST(), {
    params: { page_size: 100, ...filters },
  });
  return data.results;
}

export async function resendInvite(id: string): Promise<PendingInvite> {
  const { data } = await apiClient.post<PendingInvite>(INVITE_ENDPOINTS.RESEND(id));
  return data;
}

// Public — no auth required, called from the accept-invite page before login.
export async function getInviteDetail(token: string): Promise<InviteDetailResponse> {
  const { data } = await apiClient.get<InviteDetailResponse>(INVITE_ENDPOINTS.DETAIL(token));
  return data;
}

// Public. Response shape matches LoginScopedResponse exactly — the backend
// builds both from the same _token_pair_dict helper.
export async function acceptInvite(payload: AcceptInvitePayload): Promise<LoginScopedResponse> {
  const { data } = await apiClient.post<LoginScopedResponse>(INVITE_ENDPOINTS.ACCEPT(), payload);
  return data;
}
