import { apiClient } from "@/lib/api/client";
import { SUBJECT_ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/lib/api/types";
import type { SubjectResponse } from "@/features/onboarding/types";
import type { BulkUpdateItem } from "../lib/subject-bulk-edit";

// page_size=100 (backend max) — NERDC subject lists across multiple levels can
// easily exceed the default 25/page, and there's no pagination UI here to page through.
export async function getSubjects(): Promise<SubjectResponse[]> {
  const { data } = await apiClient.get<PaginatedResponse<SubjectResponse>>(SUBJECT_ENDPOINTS.LIST(), {
    params: { page_size: 100 },
  });
  return data.results;
}

// PUT, and the response is a bare array rather than the paginated envelope the
// list uses — it returns only the subjects that were submitted.
export async function bulkUpdateSubjects(subjects: BulkUpdateItem[]): Promise<SubjectResponse[]> {
  const { data } = await apiClient.put<SubjectResponse[]>(SUBJECT_ENDPOINTS.BULK_UPDATE(), { subjects });
  return data;
}
