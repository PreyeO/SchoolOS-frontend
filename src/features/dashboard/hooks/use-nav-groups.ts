"use client";

import { useAuthStore } from "@/stores/auth-store";
import { getNavGroupsForPersona, type Persona } from "@/data/navigation";

// School owners created via create-school have no decoded claims yet (no login
// round-trip), so default to "admin" — the same fallback dashboard-home uses.
export function useNavGroups() {
  const personas = useAuthStore((s) => s.claims?.personas);
  const persona: Persona = (personas?.[0] as Persona) ?? "admin";
  return getNavGroupsForPersona(persona);
}
