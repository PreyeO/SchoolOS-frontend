import type { CONTACT_METHODS, CONTACT_TIMES, PILOT_ROLES, STUDENT_RANGES } from "@/data/pilot";
import type { SchoolLevel } from "@/features/auth/types";

export type PilotRole = (typeof PILOT_ROLES)[number]["value"];
export type StudentRange = (typeof STUDENT_RANGES)[number]["value"];
export type ContactTime = (typeof CONTACT_TIMES)[number]["value"];
export type ContactMethod = (typeof CONTACT_METHODS)[number]["value"];

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
  // How they asked to be reached. Exactly one of phone_number/email follows,
  // matching this choice — the form doesn't collect the other.
  contact_method: ContactMethod;
  phone_number?: string;
  email?: string;
  // Omitted entirely when the visitor doesn't pick one, rather than sent empty.
  best_time_to_call?: ContactTime;
}
