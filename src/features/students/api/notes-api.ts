import { apiClient } from "@/lib/api/client";
import { STUDENT_NOTE_ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/lib/api/types";

import type { CreateStudentNotePayload, StudentNote } from "../types-notes";

// page_size=100 with no pagination UI: notes accumulate slowly (a handful per
// student per year) and the screen reads as a chronology, so paging it would
// break the narrative for no practical gain at this scale.
export async function getStudentNotes(studentId: string): Promise<StudentNote[]> {
  const { data } = await apiClient.get<PaginatedResponse<StudentNote>>(
    STUDENT_NOTE_ENDPOINTS.LIST(),
    { params: { student: studentId, page_size: 100 } },
  );
  return data.results;
}

export async function createStudentNote(
  payload: CreateStudentNotePayload,
): Promise<StudentNote> {
  const { data } = await apiClient.post<StudentNote>(STUDENT_NOTE_ENDPOINTS.LIST(), payload);
  return data;
}

// `note` is required even on PATCH — it's the model's only editable field, so
// there is no meaningful partial update. Only the authoring teacher may call
// this; anyone else gets 403.
export async function updateStudentNote(id: string, note: string): Promise<StudentNote> {
  const { data } = await apiClient.patch<StudentNote>(STUDENT_NOTE_ENDPOINTS.DETAIL(id), {
    note,
  });
  return data;
}

export async function deleteStudentNote(id: string): Promise<void> {
  await apiClient.delete(STUDENT_NOTE_ENDPOINTS.DETAIL(id));
}
