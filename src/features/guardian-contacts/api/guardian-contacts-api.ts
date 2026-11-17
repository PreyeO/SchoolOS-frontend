import { apiClient } from "@/lib/api/client";
import { GUARDIAN_CONTACT_ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/lib/api/types";

import type {
  AccountPhone,
  ContactImportResult,
  CreateContactPayload,
  GuardianContact,
  UpdateContactPayload,
} from "../types";

export interface ContactFilters {
  page?: number;
  search?: string;
  student?: string;
}

// account_phone is present only when filtered by `student` (null if that
// student has a contact).
export type ContactsPage = PaginatedResponse<GuardianContact> & { account_phone?: AccountPhone | null };

export async function getGuardianContacts(filters: ContactFilters): Promise<ContactsPage> {
  const { data } = await apiClient.get<ContactsPage>(GUARDIAN_CONTACT_ENDPOINTS.LIST(), {
    params: { ...filters, search: filters.search || undefined },
  });
  return data;
}

export async function getAccountPhones(filters: ContactFilters): Promise<PaginatedResponse<AccountPhone>> {
  const { data } = await apiClient.get<PaginatedResponse<AccountPhone>>(GUARDIAN_CONTACT_ENDPOINTS.ACCOUNT_PHONES(), {
    params: { ...filters, search: filters.search || undefined },
  });
  return data;
}

export async function createGuardianContact(payload: CreateContactPayload): Promise<GuardianContact> {
  const { data } = await apiClient.post<GuardianContact>(GUARDIAN_CONTACT_ENDPOINTS.LIST(), payload);
  return data;
}

export async function updateGuardianContact(id: string, payload: UpdateContactPayload): Promise<GuardianContact> {
  const { data } = await apiClient.patch<GuardianContact>(GUARDIAN_CONTACT_ENDPOINTS.DETAIL(id), payload);
  return data;
}

export async function deleteGuardianContact(id: string): Promise<void> {
  await apiClient.delete(GUARDIAN_CONTACT_ENDPOINTS.DETAIL(id));
}

// The client's default Content-Type is application/json, and axios turns a
// FormData body into JSON under that header, so the File would arrive as {}.
// Naming multipart here skips that; axios then drops the header and the
// browser sets the real one with its boundary (see invitations-api postCsv).
async function postCsv(url: string, file: File): Promise<ContactImportResult> {
  const form = new FormData();
  form.append("file", file);
  const { data } = await apiClient.post<ContactImportResult>(url, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

// Preview and commit take the same file; the server keeps nothing between them.
export function previewContactImport(file: File): Promise<ContactImportResult> {
  return postCsv(GUARDIAN_CONTACT_ENDPOINTS.IMPORT_PREVIEW(), file);
}

export function commitContactImport(file: File): Promise<ContactImportResult> {
  return postCsv(GUARDIAN_CONTACT_ENDPOINTS.IMPORT(), file);
}
