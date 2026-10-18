import type { SchoolLevelValue } from "@/data/school-levels";
import type { UserDetail } from "@/lib/api/profile-summary";
import type { SchoolAccessStatus } from "@/lib/school/get-school-detail";
import type { SchoolType } from "@/lib/school/derive-school-type";

// GET /api/schools/ as a platform admin — every school on the platform.
//
// Deliberately NOT the same shape as the school-side SchoolDetailResponse:
// the list serializer omits every billing field (student_capacity,
// trial_ends_at, price_per_student all absent, not null), so anything about
// money or dates has to come from the detail route or /schools/financials/.
// access_status IS here, which is what makes the list useful on its own.
export interface PlatformSchool {
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
  access_status: SchoolAccessStatus;
  created_at: string;
}

// One row of GET /api/schools/financials/.
//
// billable_students is NOT student_count: the backend bills on
// max(capacity, BILLING_FLOOR_STUDENTS), so a school of 4 pupils with a
// declared capacity of 300 is billed for 300. Showing both is the point —
// the gap between them is the conversation to have with that school.
//
// price_is_locked distinguishes a real subscribed price from the default
// used as a projection for schools that haven't subscribed, so the revenue
// figure is honest about which part of it is hypothetical.
export interface SchoolFinancialRow {
  school: PlatformSchool;
  access_status: SchoolAccessStatus;
  student_capacity: number;
  student_count: number;
  billable_students: number;
  price_per_student: number;
  price_is_locked: boolean;
  estimated_termly_revenue: number;
  // Scratch cards: money actually collected, unlike the projection above.
  // activated counts a bound card even after it's revoked, plus its bound
  // replacement, so it can exceed sold.
  scratch_card_revenue: number;
  scratch_cards_sold: number;
  scratch_cards_activated: number;
}

export interface PlatformFinancials {
  schools: SchoolFinancialRow[];
  school_count: number;
  subscribed_school_count: number;
  estimated_termly_revenue_total: number;
  scratch_card_revenue_total: number;
}

export interface PlatformAdminRole {
  id: string;
  name: string;
  permissions: string[];
}

export interface PlatformAdmin {
  id: string;
  user: UserDetail;
  platform_admin_role: PlatformAdminRole | null;
  is_active: boolean;
  created_at: string;
}

// POST /api/schools/{id}/extend-access/ — the only write a platform admin has.
//
// At least one of the two dates is required. price_per_student is rejected
// unless a subscription window exists already or is being set in the same
// call, which is why the UI offers two separate actions rather than one form
// exposing all three fields.
export interface ExtendAccessPayload {
  trial_ends_at?: string;
  subscription_ends_at?: string;
  price_per_student?: number;
}
