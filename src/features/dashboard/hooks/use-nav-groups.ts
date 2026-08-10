"use client";

import { useAuthStore } from "@/stores/auth-store";
import { getNavGroupsForPersonas, isPersona, type Persona } from "@/data/navigation";

// School owners created via create-school have no decoded claims yet (no login
// round-trip), so default to "admin" — the same fallback dashboard-home uses.
//
// Uses every persona the token carries, not just the first. A user who is both
// an admin and a teacher gets both sets of nav; picking personas[0] gave them
// whichever the backend happened to list first.
export function useNavGroups() {
  const personas = useAuthStore((s) => s.claims?.personas);
  const known: Persona[] = (personas ?? []).filter(isPersona);
  return getNavGroupsForPersonas(known.length > 0 ? known : ["admin"]);
}
