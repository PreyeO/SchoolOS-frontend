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
  // Computed server-side as {slug}.myschoolos.io — the school's real address.
  // Present on every response; it was simply never typed until the platform
  // panel needed to show it. (The payload also carries state, country,
  // is_active, is_verified, created_at and updated_at, still untyped because
  // nothing reads them yet.)
  subdomain: string;
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
  // SCHOOL_BILLING_FIELDS, returned only when the caller is a platform admin or
  // an active ADMIN at this school (SchoolViewSet._user_can_see_billing). A
  // teacher/parent/student reading their own school gets the response without
  // them, hence optional rather than nullable — absent and null mean different
  // things here ("you can't see this" vs "not set").
  student_capacity?: number;
  trial_ends_at?: string | null;
  subscription_ends_at?: string | null;
  price_per_student?: number | null;
  access_status?: SchoolAccessStatus;
  has_active_access?: boolean;
}

// accounts/enums.py SchoolAccessStatus — note the value is "trialing", not
// "trial". `subscribed` is the only one that makes a capacity increase
// chargeable; see estimateProration.
export type SchoolAccessStatus = "trialing" | "subscribed" | "expired";

export async function getSchoolDetail(schoolId: string): Promise<SchoolDetailResponse> {
  const { data } = await apiClient.get<SchoolDetailResponse>(SCHOOL_ENDPOINTS.DETAIL(schoolId));
  return data;
}
