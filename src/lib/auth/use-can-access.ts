"use client";

import { canAccessPath, isPersona, type Persona } from "@/data/navigation";
import { useAuthStore } from "@/stores/auth-store";

// Whether this user may open a route — the same question RouteAccessGuard asks,
// available before you offer them the link.
//
// Exists because empty-state copy kept pointing people at doors that wouldn't
// open: the broadsheet told a teacher to "add them in Teaching Assignments",
// the leaderboard told them to "publish in Publish Results", and the sidebar
// footer offered every teacher a Settings link. All three are admin-only, so
// the result was a dead end that also implied they'd failed to do something
// they were never allowed to do.
//
// Keyed off the nav registry rather than a persona check, so it stays right if
// a route's audience changes — the broadsheet itself went from admin-only to
// staff mid-development, and a hardcoded useIsSchoolAdmin() would have silently
// kept hiding things from the teachers who could now use them.
//
// Same ["admin"] fallback as useNavGroups and RouteAccessGuard: an owner who
// created a school this session has no decoded personas yet and must not be
// treated as having none.
export function useCanAccess(href: string): boolean {
  const claims = useAuthStore((s) => s.claims);
  const known: Persona[] = (claims?.personas ?? []).filter(isPersona);
  return canAccessPath(href, known.length > 0 ? known : ["admin"]);
}
