"use client";

import { useSchoolPermissions } from "./use-school-permissions";

// Whether the signed-in admin's role carries a given school permission.
//
// The JWT only carries personas, not permissions — /me is the one place the
// role's permission list is exposed. Worth reading before showing a screen whose
// every action would 403: HasSchoolPermission gates several endpoints on strings
// like manage_remarks or lock_results, and an admin without one can reach the
// page (they're an admin) but do nothing on it.
//
// Honours the active persona via useSchoolPermissions: an admin working as a
// teacher gets false, so admin-only actions (enrolling, reissuing a password,
// recording a payment) drop out of the teacher view with the admin sidebar.
//
// Returns false while /me is loading, so a gated screen never flashes its
// contents before being withdrawn.
export function useHasSchoolPermission(permission: string): boolean {
  return useSchoolPermissions()?.includes(permission) ?? false;
}
