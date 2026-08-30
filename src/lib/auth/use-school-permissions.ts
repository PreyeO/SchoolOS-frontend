"use client";

import { useMe } from "@/features/me/hooks/use-me";
import type { PermissionSet } from "@/data/navigation";

// The caller's school permissions, or null while they're still unknown.
//
// Three states, and the middle one is the whole reason this exists:
//
//   null  — /auth/me/ hasn't answered yet. Not the same as "no permissions";
//           callers treat it as allow, so the sidebar doesn't blank out and
//           refill on a fresh login. Returning users skip this entirely, since
//           the query cache is persisted per membership.
//   []    — answered, and this caller has none. A roleless admin is real
//           (school_admin_role is nullable, and a roleless admin has no
//           permissions), as is any non-admin persona. Genuinely denied.
//   [...] — the role's permission strings.
//
// Shared so the sidebar, the route guard and useCanAccess can't drift into
// different readings of the same three states.
export function useSchoolPermissions(): PermissionSet {
  const { data: me } = useMe();
  if (!me) return null;
  return me.admin?.school_admin_role?.permissions ?? [];
}
