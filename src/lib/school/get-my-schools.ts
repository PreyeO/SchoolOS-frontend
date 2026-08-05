import { apiClient } from "@/lib/api/client";
import { SCHOOL_ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/lib/api/types";
import type { SchoolLevelValue } from "@/data/school-levels";
import type { SchoolType } from "./derive-school-type";

// Confirmed against accounts/serializers.py SchoolListSerializer — the summary
// shape used for GET /api/schools/. Omits branding (primary_color/accent_color/
// logo colors aren't here, just a plain logo URL) — fetch get-school-detail.ts
// for the full record once a school is actually switched to.
export interface MySchool {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  school_type: SchoolType;
  levels: SchoolLevelValue[];
  city: string;
  state: string;
  logo: string | null;
  is_active: boolean;
  created_at: string;
}

// Every school the caller has an active membership at, regardless of which
// one their current token happens to be scoped to — powers the school
// switcher. A user with dozens of schools is not a realistic case yet, so no
// pagination handling beyond reading the first page.
export async function getMySchools(): Promise<MySchool[]> {
  const { data } = await apiClient.get<PaginatedResponse<MySchool>>(SCHOOL_ENDPOINTS.LIST());
  return data.results;
}
