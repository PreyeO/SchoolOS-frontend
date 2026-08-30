"use client";

import { useSchoolProfile } from "@/features/settings/hooks/use-school-profile";
import type { SchoolAccessStatus } from "@/lib/school/get-school-detail";

export interface AccessStatus {
  status: SchoolAccessStatus;
  // Whole days until the current window closes, floored, never negative. Null
  // when there's no date to count to — the school detail carries
  // trial_ends_at/subscription_ends_at independently of access_status, so a
  // subscribed school with no end date recorded has no countdown to show.
  daysLeft: number | null;
  isTrialing: boolean;
  isExpired: boolean;
}

function daysUntil(iso: string | null | undefined): number | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  return Math.max(Math.floor(ms / 86_400_000), 0);
}

// The school's real access state.
//
// Replaces a hardcoded mock that returned `{ isTrialing: true, daysLeft: 24 }`
// to every school forever — so a subscribed school was told it was on trial,
// and an EXPIRED school (whose writes are already being refused) saw a
// comfortable 24-day countdown instead of a warning. The mock's own comment
// said billing wasn't built; it is now.
//
// Derived from the school profile rather than a new endpoint: useSchoolProfile
// already fetches GET /schools/{id}/, which carries access_status and both end
// dates. Same cache entry, no extra request.
//
// Returns null for anyone who can't see billing. The backend omits those
// fields entirely for non-admins (verified: a teacher's response has none of
// them), so this is "not yours to see" rather than "not set" — and the callers
// render nothing, which is right. A teacher shouldn't be shown the school's
// billing state at all.
export function useAccessStatus(): AccessStatus | null {
  const { data: school } = useSchoolProfile();

  if (!school?.access_status) return null;

  const endsAt =
    school.access_status === "subscribed" ? school.subscription_ends_at : school.trial_ends_at;

  return {
    status: school.access_status,
    daysLeft: daysUntil(endsAt),
    isTrialing: school.access_status === "trialing",
    isExpired: school.access_status === "expired",
  };
}
