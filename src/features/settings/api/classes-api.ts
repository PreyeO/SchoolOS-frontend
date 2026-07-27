import { apiClient } from "@/lib/api/client";
import { CLASS_ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/lib/api/types";
import type { ClassResponse } from "@/features/onboarding/types";

// page_size=100 (backend max) — a school with several levels/arms can easily
// exceed the default 25/page, and there's no pagination UI here to page through.
export async function getClasses(): Promise<ClassResponse[]> {
  const { data } = await apiClient.get<PaginatedResponse<ClassResponse>>(CLASS_ENDPOINTS.LIST(), {
    params: { page_size: 100 },
  });
  return data.results;
}
