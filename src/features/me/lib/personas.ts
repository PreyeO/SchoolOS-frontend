import type { MembershipSummary } from "@/lib/api/profile-summary";

// The personas active on this membership, in a fixed order so the badges don't
// reshuffle between renders.
//
// Read off the membership booleans rather than the JWT's `personas` claim:
// the claim is baked at login and goes stale the moment someone is granted a
// second persona, while /me is fetched fresh. "owner" is deliberately not here
// — it's a flavour of admin, carried on the admin role, not a persona of its
// own.
export function activePersonas(membership: MembershipSummary): string[] {
  const labels: string[] = [];
  if (membership.is_admin) labels.push("Admin");
  if (membership.is_teacher) labels.push("Teacher");
  if (membership.is_parent) labels.push("Parent");
  if (membership.is_student) labels.push("Student");
  return labels;
}
