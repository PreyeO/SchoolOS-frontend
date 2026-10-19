"use client";

import { env } from "@/config/env";
import { useSchoolStore } from "@/stores/school-store";

import type { SlipDetails } from "../lib/pins-pdf";

// What every printed or downloaded slip says besides the serial and PIN.
// The checker address is the apex, not this school's subdomain: a card works
// from any host, and the bare domain is the shortest thing to type.
export function useSlipDetails(sessionName: string): SlipDetails {
  const schoolName = useSchoolStore((s) => s.currentSchool?.name) ?? "Your school";
  return { schoolName, sessionName, checkUrl: `${env.SCHOOL_DOMAIN}/check-result` };
}
