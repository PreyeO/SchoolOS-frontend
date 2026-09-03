import { apiClient } from "@/lib/api/client";
import { ENDPOINTS, INVITE_ENDPOINTS, ROLE_ENDPOINTS, STUDENT_ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/lib/api/types";

import type { InviteAdminFormValues } from "../schemas/invite-admin-schema";
import type { InviteTeacherFormValues } from "../schemas/invite-teacher-schema";
import type { InviteParentFormValues } from "../schemas/invite-parent-schema";
import type { AddStudentFormValues } from "../schemas/add-student-schema";
import type {
  AcceptInvitePayload,
  AddStudentPayload,
  BulkImportResult,
  DetailResponse,
  InviteAdminPayload,
  InviteDetailResponse,
  InviteParentChild,
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

// The optional link fields sit outside the zod schema on purpose: they're not
// text inputs, they're separate pickers with their own state, and neither is
// validated by shape — the backend owns the rules (an arm must be active and
// at this school, a child must not repeat).
export type InviteTeacherInput = InviteTeacherFormValues & { class_arm_ids?: string[] };
export type InviteParentInput = InviteParentFormValues & { students?: InviteParentChild[] };

export async function inviteTeacher(values: InviteTeacherInput): Promise<DetailResponse> {
  const payload: InviteTeacherPayload = {
    first_name: values.first_name,
    last_name: values.last_name,
    email: values.email,
    teacher_type: values.teacher_type,
    ...(values.phone_number?.trim() ? { phone_number: values.phone_number } : {}),
    // Omitted rather than sent empty: the field is optional, and an empty list
    // would be a no-op the audit log doesn't need to see.
    ...(values.class_arm_ids?.length ? { class_arm_ids: values.class_arm_ids } : {}),
  };
  const { data } = await apiClient.post<DetailResponse>(ENDPOINTS.INVITE_TEACHER, payload);
  return data;
}

export async function inviteParent(values: InviteParentInput): Promise<DetailResponse> {
  const payload: InviteParentPayload = {
    first_name: values.first_name,
    last_name: values.last_name,
    email: values.email,
    ...(values.phone_number?.trim() ? { phone_number: values.phone_number } : {}),
    ...(values.students?.length ? { students: values.students } : {}),
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

// The instance default (client.ts) is Content-Type: application/json — left
// as-is, axios's own transformRequest would JSON.stringify the FormData
// instead of sending it, since it only skips that when the resolved header
// does NOT already look like JSON. Overriding it here to "multipart/form-data"
// avoids that branch; axios then deletes it again downstream and lets the
// browser set the real header with its boundary, exactly like an uncontrolled
// FormData post would. Both bulk-import routes need this, so it's shared.
// Per-call override of the client's 15s default, which a real import blows
// straight through: commit hashes one password per new student, and PBKDF2
// costs ~810ms each on the dev container (measured) — so 300 rows is ~4 minutes
// of hashing alone. Without this, axios aborts at 15s while the server carries
// on writing, which is the worst outcome available: the students get created
// and the admin sees a network error with no credentials for any of them.
//
// Deliberately scoped to these two calls rather than raised globally. 15s is
// right everywhere else, and a long global timeout turns an unreachable server
// into a multi-minute hang on every screen.
//
// Set ABOVE the server's own worker timeout (200s was the figure agreed with
// the backend), not equal to it. Matching them exactly is a race: whichever
// fires first wins, and the client winning means we discard a response the
// server was about to send. Letting the server always answer first means a
// real failure arrives as a real error instead of an ambiguous abort.
const BULK_IMPORT_TIMEOUT_MS = 210_000;

function postCsv(url: string, file: File): Promise<{ data: BulkImportResult }> {
  const formData = new FormData();
  formData.append("file", file);
  return apiClient.post<BulkImportResult>(url, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: BULK_IMPORT_TIMEOUT_MS,
  });
}

// Identical shape to bulkImportStudents; writes nothing (commit=False
// server-side) so it's safe to call on every file selection.
export async function previewBulkImportStudents(file: File): Promise<BulkImportResult> {
  const { data } = await postCsv(STUDENT_ENDPOINTS.BULK_IMPORT_PREVIEW(), file);
  return data;
}

export async function bulkImportStudents(file: File): Promise<BulkImportResult> {
  const { data } = await postCsv(STUDENT_ENDPOINTS.BULK_IMPORT(), file);
  return data;
}

export async function getRoles(): Promise<Role[]> {
  const { data } = await apiClient.get<RolesListResponse>(ROLE_ENDPOINTS.LIST());
  return data.results;
}

// Returns the envelope, not just `results` — the panel needs `count` to render
// PaginationControls. Previously this asked for page_size=100 and threw the
// count away on the assumption a school would stay under it; invites accumulate
// (accepted and expired ones never leave the list), so the 101st was simply
// unreachable with nothing on screen saying so.
//
// No page_size param: the backend's default is 25 and PAGE_SIZE in the panel
// matches it, the same arrangement the Staff/Student/Parent directories use.
export async function getPendingInvites(
  filters: PendingInvitesFilters,
): Promise<PaginatedResponse<PendingInvite>> {
  const { data } = await apiClient.get<PaginatedResponse<PendingInvite>>(INVITE_ENDPOINTS.LIST(), {
    params: filters,
  });
  return data;
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
