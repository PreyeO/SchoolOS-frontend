import type { SchoolDetailResponse } from "@/lib/school/get-school-detail";

// The backend's billing window. UserService.update_student_capacity divides
// days_remaining by 90 — a term — to prorate a mid-subscription increase.
const BILLING_WINDOW_DAYS = 90;

export interface ProrationEstimate {
  studentsAdded: number;
  daysRemaining: number;
  amount: number;
}

// What a capacity increase will cost, worked out before committing it.
//
// This DUPLICATES UserService.update_student_capacity's formula, which is a
// real risk worth naming: if the backend changes its window or rounding, this
// silently disagrees. It's duplicated anyway because the authoritative number
// only exists in the response — i.e. after the charge has been recorded — and
// the school asked for the amount to be confirmed *before* the admin commits.
//
// So this is shown as an estimate and the response's own prorated_amount is
// shown afterwards as the real figure. If they ever diverge, the admin sees
// the true number at the point it matters rather than being misled by ours.
//
// Returns null when nothing would be charged, which is the common case:
//   - a decrease, or no change
//   - a school still on trial (access_status !== "subscribed")
//   - no price_per_student locked in
// The backend records no CapacityAdjustment in any of those, so the dialog
// shows no money at all rather than "₦0".
export function estimateProration(
  school: Pick<
    SchoolDetailResponse,
    "student_capacity" | "access_status" | "price_per_student" | "subscription_ends_at"
  >,
  newCapacity: number,
): ProrationEstimate | null {
  const current = school.student_capacity;
  if (current === undefined || newCapacity <= current) return null;
  if (school.access_status !== "subscribed") return null;
  if (!school.price_per_student || !school.subscription_ends_at) return null;

  // Math.floor to match Python's (end - now).days, which truncates toward zero
  // for a positive delta rather than rounding. Clamped at 0, same as the
  // backend's max(..., 0) guard for an already-ended subscription.
  const msRemaining = new Date(school.subscription_ends_at).getTime() - Date.now();
  const daysRemaining = Math.max(Math.floor(msRemaining / 86_400_000), 0);

  const studentsAdded = newCapacity - current;
  return {
    studentsAdded,
    daysRemaining,
    // Verified against the backend across a spread of inputs — identical in
    // every case except an exact .5, where Python's round() is banker's
    // (0.5 -> 0) and JS's is half-up (0.5 -> 1). That's a ₦1 difference on a
    // value that has to land precisely on a half naira, so it's left alone
    // rather than reimplementing banker's rounding here; the response's own
    // prorated_amount is what the school is actually invoiced.
    amount: Math.round(
      studentsAdded * school.price_per_student * (daysRemaining / BILLING_WINDOW_DAYS),
    ),
  };
}
