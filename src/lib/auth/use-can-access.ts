"use client";

import { canAccessPath } from "@/data/navigation";
import { useActivePersona } from "./use-active-persona";
import { useSchoolPermissions } from "./use-school-permissions";

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
// Answers for the active persona, same as the sidebar and the guard: an admin
// working as a teacher isn't offered admin links, since the guard would refuse
// them on arrival.
export function useCanAccess(href: string): boolean {
  const persona = useActivePersona();
  const permissions = useSchoolPermissions();
  return canAccessPath(href, [persona], permissions);
}
