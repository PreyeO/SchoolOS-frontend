import { apiClient } from "@/lib/api/client";
import { SCHOOL_ENDPOINTS } from "@/lib/api/endpoints";
import type { SchoolLevelValue } from "@/data/school-levels";
import type { SchoolType } from "./derive-school-type";

// The full school detail response (GET /api/schools/:id/) — includes levels
// and branding (school-list's summary omits both). Lives in lib/ (not
// features/onboarding/) because auth flows (login, verify-otp) also need it
// to hydrate branding on an existing school — same reasoning as
// lib/school/get-onboarding-stage.ts.
export interface SchoolDetailResponse {
  id: string;
  name: string;
  slug: string;
  school_type: SchoolType;
  levels: SchoolLevelValue[];
  logo: string | null;
  primary_color: string;
  accent_color: string;
  motto: string | null;
}

export async function getSchoolDetail(schoolId: string): Promise<SchoolDetailResponse> {
  const { data } = await apiClient.get<SchoolDetailResponse>(SCHOOL_ENDPOINTS.DETAIL(schoolId));
  return data;
}
