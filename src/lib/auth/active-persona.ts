import type { Persona } from "@/data/nav/types";
import type { MembershipSummary } from "@/lib/api/profile-summary";

// The personas a member can work as, one at a time. "owner" is not one of them
// — it's a flavour of admin, carried on the admin role — and "bursar" is a nav
// audience the backend never emits (a bursar is an admin with a fee-only role).
export type SwitchablePersona = Extract<Persona, "admin" | "teacher" | "parent" | "student">;

// Priority for the default, and the order the switcher lists them in. Fixed
// here rather than taken from the JWT's personas array, whose order is an
// accident of accounts/tokens.py's if-chain, not a statement of preference.
export const PERSONA_PRIORITY: SwitchablePersona[] = ["admin", "teacher", "parent", "student"];

export const PERSONA_LABELS: Record<SwitchablePersona, string> = {
  admin: "Admin",
  teacher: "Teacher",
  parent: "Parent",
  student: "Student",
};

// Read off /me's membership booleans. Preferred over the token whenever /me has
// answered: the claim is baked at login and goes stale the moment someone is
// granted a second persona, while /me is fetched fresh.
export function personasFromMembership(membership: MembershipSummary): SwitchablePersona[] {
  const held: Record<SwitchablePersona, boolean> = {
    admin: membership.is_admin,
    teacher: membership.is_teacher,
    parent: membership.is_parent,
    student: membership.is_student,
  };
  return PERSONA_PRIORITY.filter((p) => held[p]);
}

// The token's claim, reordered into priority order and stripped of "owner" and
// anything unrecognised. Only used until /me arrives.
export function personasFromClaims(claimed: string[]): SwitchablePersona[] {
  return PERSONA_PRIORITY.filter((p) => claimed.includes(p));
}

// The stored choice if the member still holds it, otherwise the highest-priority
// persona they do hold. A stale choice — the teacher persona was removed, say —
// falls through to the default rather than locking them into a mode they no
// longer have. Null only when they hold nothing at all.
export function resolveActivePersona(
  available: SwitchablePersona[],
  stored: string | undefined,
): SwitchablePersona | null {
  const match = available.find((p) => p === stored);
  return match ?? available[0] ?? null;
}
