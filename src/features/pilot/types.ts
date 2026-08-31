import type { CONTACT_TIMES, PILOT_ROLES, STUDENT_RANGES } from "@/data/pilot";
import type { SchoolLevel } from "@/features/auth/types";

export type PilotRole = (typeof PILOT_ROLES)[number]["value"];
export type StudentRange = (typeof STUDENT_RANGES)[number]["value"];
export type ContactTime = (typeof CONTACT_TIMES)[number]["value"];

// What POST /api/demo-requests/ is expected to accept.
// ⚠️ Unconfirmed — see lib/api/endpoints/pilot.ts.
export interface DemoRequestPayload {
  full_name: string;
  role: PilotRole;
  school_name: string;
  state: string;
  city: string;
  levels: SchoolLevel[];
  student_range: StudentRange;
  email: string;
  phone_number: string;
  // Both omitted entirely when unanswered, rather than sent empty.
  best_time_to_call?: ContactTime;
  message?: string;
}
