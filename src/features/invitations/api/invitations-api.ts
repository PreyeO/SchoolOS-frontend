import { apiClient } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";

import type { InviteAdminFormValues } from "../schemas/invite-admin-schema";
import type { InviteTeacherFormValues } from "../schemas/invite-teacher-schema";
import type { InviteParentFormValues } from "../schemas/invite-parent-schema";
import type { AddStudentFormValues } from "../schemas/add-student-schema";
import type {
  AddStudentPayload,
  DetailResponse,
  InviteAdminPayload,
  InviteParentPayload,
  InviteTeacherPayload,
  Role,
  RolesListResponse,
  StudentCreatedResponse,
} from "../types";

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
    ...(values.date_of_birth?.trim() ? { date_of_birth: values.date_of_birth } : {}),
    ...(values.email?.trim() ? { email: values.email } : {}),
  };
  const { data } = await apiClient.post<StudentCreatedResponse>(ENDPOINTS.INVITE_STUDENT, payload);
  return data;
}

export async function getRoles(): Promise<Role[]> {
  const { data } = await apiClient.get<RolesListResponse>(ENDPOINTS.ROLES);
  return data.results;
}
