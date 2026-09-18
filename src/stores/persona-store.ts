"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import type { SwitchablePersona } from "@/lib/auth/active-persona";
import { ssrSafeLocalStorage } from "@/lib/storage/ssr-safe-local-storage";

interface PersonaState {
  // The persona each membership last chose to work as, keyed by membership_id.
  //
  // Keyed per membership rather than held as one value, so the choice can't
  // leak: membership_id identifies one person at one school, so a second
  // school, or a colleague signing in on the same staffroom browser, never
  // inherits it. Deliberately survives logout — it's a preference, not
  // anything sensitive, and the same person signing back in expects it kept.
  //
  // Only an explicit choice is written. The default is computed on read (see
  // resolveActivePersona), so a fallback shown while /me is still loading can
  // never overwrite what the member actually picked.
  byMembership: Record<string, SwitchablePersona>;
  setActivePersona: (membershipId: string, persona: SwitchablePersona) => void;
}

export const usePersonaStore = create<PersonaState>()(
  persist(
    (set) => ({
      byMembership: {},
      setActivePersona: (membershipId, persona) =>
        set((s) => ({ byMembership: { ...s.byMembership, [membershipId]: persona } })),
    }),
    {
      name: "schoolos-active-persona",
      storage: createJSONStorage(() => ssrSafeLocalStorage),
    },
  ),
);
