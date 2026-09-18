"use client";

import { useMe } from "@/features/me/hooks/use-me";
import type { PermissionSet } from "@/data/navigation";
import { useActivePersona } from "./use-active-persona";

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
//           permissions), as is anyone working as a non-admin persona.
//           Genuinely denied.
//   [...] — the role's permission strings.
//
// Only the admin persona carries the role. Someone who is also a teacher and
// has switched to teacher mode gets [], so the teacher view doesn't keep
// admin-gated items and actions just because /me still lists the role.
//
// Shared so the sidebar, the route guard and useCanAccess can't drift into
// different readings of the same three states.
export function useSchoolPermissions(): PermissionSet {
  const persona = useActivePersona();
  const rolePermissions = useRolePermissions();
  return persona === "admin" ? rolePermissions : [];
}

// The role's permissions whatever persona is active. Only for asking "could a
// switch fix this" — anything deciding what to show uses useSchoolPermissions.
export function useRolePermissions(): PermissionSet {
  const { data: me } = useMe();
  if (!me) return null;
  return me.admin?.school_admin_role?.permissions ?? [];
}
