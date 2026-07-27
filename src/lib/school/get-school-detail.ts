import { apiClient } from "@/lib/api/client";
import { SCHOOL_ENDPOINTS } from "@/lib/api/endpoints";
import type { SchoolLevelValue } from "@/data/school-levels";
import type { SchoolType } from "./derive-school-type";

// The full school detail response (GET /api/schools/:id/) — includes levels,
// branding, and the full profile (school-list's summary omits all of these).
// Lives in lib/ (not features/onboarding/) because auth flows (login,
// verify-otp) and dashboard Settings both need it — same reasoning as
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
  address: string;
  city: string;
  phone_number: string;
  email: string;
  website: string | null;
}

export async function getSchoolDetail(schoolId: string): Promise<SchoolDetailResponse> {
  const { data } = await apiClient.get<SchoolDetailResponse>(SCHOOL_ENDPOINTS.DETAIL(schoolId));
  return data;
}
