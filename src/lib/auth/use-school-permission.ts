"use client";

import { useMe } from "@/features/me/hooks/use-me";

// Whether the signed-in admin's role carries a given school permission.
//
// The JWT only carries personas, not permissions — /me is the one place the
// role's permission list is exposed. Worth reading before showing a screen whose
// every action would 403: HasSchoolPermission gates several endpoints on strings
// like manage_remarks or lock_results, and an admin without one can reach the
// page (they're an admin) but do nothing on it.
//
// Returns false while /me is loading, so a gated screen never flashes its
// contents before being withdrawn.
export function useHasSchoolPermission(permission: string): boolean {
  const { data: me } = useMe();
  return me?.admin?.school_admin_role?.permissions?.includes(permission) ?? false;
}
