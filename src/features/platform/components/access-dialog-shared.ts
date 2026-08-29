"use client";

import { toLocalIsoDate } from "@/lib/text/format-date";

// Two dialogs over one endpoint, deliberately.
//
// POST extend-access takes trial_ends_at, subscription_ends_at and
// price_per_student, and refuses a price unless a subscription window exists
// or is set in the same call. Exposing all three in one form makes that rule
// something staff discover by hitting a 400. Splitting by intent — extend a
// trial, or put a school on a paid subscription — makes the invalid
// combination unreachable instead.
//
// Both send a date-only value; the field is a DateTimeField server-side and
// accepts it.
export function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toLocalIsoDate(d);
}
