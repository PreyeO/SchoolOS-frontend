import type { ContactTime, PilotRole, StudentRange } from "@/features/pilot/types";
import type { SchoolLevel } from "@/features/auth/types";

// Where the lead has got to. Set by a platform admin; every other field on a
// demo request is immutable once submitted.
export type DemoRequestStatus = "pending" | "contacted" | "converted" | "declined";

export const DEMO_REQUEST_STATUSES: DemoRequestStatus[] = [
  "pending",
  "contacted",
  "converted",
  "declined",
];

// GET /api/demo-requests/ — the read shape, confirmed live. The values here are
// the same strings the public form submits, so the pilot feature's own types
// are reused rather than restated.
export interface DemoRequest {
  id: string;
  full_name: string;
  role: PilotRole;
  phone_number: string;
  email: string;
  school_name: string;
  state: string;
  city: string;
  levels: SchoolLevel[];
  student_range: StudentRange;
  best_time_to_call: ContactTime | null;
  message: string | null;
  status: DemoRequestStatus;
  created_at: string;
  updated_at: string;
}

// Mirrors DemoRequestFilter on the backend. created_at_* are dates
// (YYYY-MM-DD), matching the created_at_after / created_at_before convention
// the profile lists already use.
export interface DemoRequestFilters {
  search?: string;
  status?: DemoRequestStatus;
  role?: PilotRole;
  student_range?: StudentRange;
  state?: string;
  created_at_after?: string;
  created_at_before?: string;
}
