import { apiClient } from "@/lib/api/client";
import { SCHOOL_ENDPOINTS } from "@/lib/api/endpoints";
import type { SchoolDetailResponse } from "@/lib/school/get-school-detail";

// Confirmed against accounts/serializers.py SchoolBrandingUpdateSerializer —
// this PATCH accepts the full profile, not just the 4 branding fields
// onboarding sends. Excludes slug/levels/school_type/state/country/billing —
// those aren't editable via this endpoint at all.
export interface SchoolProfilePayload {
  name: string;
  address: string;
  city: string;
  phone_number: string;
  email: string;
  website?: string;
  logo?: string;
  primary_color: string;
  accent_color: string;
  motto?: string;
}

export async function updateSchoolProfile(
  schoolId: string,
  payload: SchoolProfilePayload,
): Promise<SchoolDetailResponse> {
  const { data } = await apiClient.patch<SchoolDetailResponse>(SCHOOL_ENDPOINTS.DETAIL(schoolId), payload);
  return data;
}
