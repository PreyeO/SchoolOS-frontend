import { apiClient } from "@/lib/api/client";
import { ACADEMIC_SESSION_ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/lib/api/types";
import type { AcademicSessionResponse } from "@/features/onboarding/types";

// A school realistically never has more than a handful of sessions, so a
// single page (backend default 25/page) always covers it — no pagination UI needed.
export async function getAcademicSessions(): Promise<AcademicSessionResponse[]> {
  const { data } = await apiClient.get<PaginatedResponse<AcademicSessionResponse>>(
    ACADEMIC_SESSION_ENDPOINTS.LIST(),
  );
  return data.results;
}
