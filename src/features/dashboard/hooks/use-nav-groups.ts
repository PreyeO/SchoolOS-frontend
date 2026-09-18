"use client";

import { useActivePersona } from "@/lib/auth/use-active-persona";
import { useSchoolPermissions } from "@/lib/auth/use-school-permissions";
import { getNavGroupsForPersonas } from "@/data/navigation";

// The sidebar for the persona the member is working as — not the union of
// every persona they hold. An admin who also teaches used to get both sets of
// nav at once; they now get one and switch between them from the user menu.
//
// useActivePersona already carries the "admin" fallback for an owner fresh from
// create-school, so there's no empty list to guard against here.
export function useNavGroups() {
  const persona = useActivePersona();
  const permissions = useSchoolPermissions();
  return getNavGroupsForPersonas([persona], permissions);
}
