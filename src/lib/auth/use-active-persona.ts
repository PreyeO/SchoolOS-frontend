"use client";

import { useCallback, useMemo } from "react";

import { useMe } from "@/features/me/hooks/use-me";
import { useAuthStore } from "@/stores/auth-store";
import { usePersonaStore } from "@/stores/persona-store";
import {
  personasFromClaims,
  personasFromMembership,
  resolveActivePersona,
  type SwitchablePersona,
} from "./active-persona";

// Every persona this membership holds, in priority order. What the switcher
// offers — and nothing else should read it to decide what to *show*, because
// the app works as one persona at a time (see useActivePersona).
//
// /me wins over the token once it has answered, since the token goes stale
// when a persona is granted after login. The membership id check guards the
// window where /me could still describe a previous membership: it's
// cross-checked against the token rather than trusted.
//
// Falls back to ["admin"] when nothing is known yet — same case and same
// choice as useActivePersona's own fallback (an owner fresh from create-school
// has no decoded personas), kept here too so the switcher never renders empty.
export function useAvailablePersonas(): SwitchablePersona[] {
  const { data: me } = useMe();
  const claims = useAuthStore((s) => s.claims);

  return useMemo(() => {
    const resolved =
      me && me.membership.id === claims?.membership_id
        ? personasFromMembership(me.membership)
        : personasFromClaims(claims?.personas ?? []);
    return resolved.length > 0 ? resolved : ["admin"];
  }, [me, claims]);
}

// The one persona the member is working as right now. Sidebar, route access,
// the dashboard home and every persona check (useIsTeacher and friends) read
// this, not the full list — someone who is both an admin and a teacher gets
// one coherent app at a time rather than the union of both.
//
// UI only. The token and the API still authorise the whole membership, so this
// narrows what's shown, never what's allowed.
//
// Falls back to "admin" when nothing is known yet, the same fallback the
// sidebar, route guard and home have always used: an owner fresh from
// create-school must not be treated as holding no persona at all.
export function useActivePersona(): SwitchablePersona {
  const available = useAvailablePersonas();
  const membershipId = useAuthStore((s) => s.claims?.membership_id);
  const stored = usePersonaStore((s) => (membershipId ? s.byMembership[membershipId] : undefined));
  return resolveActivePersona(available, stored) ?? "admin";
}

// Records a choice for the current membership. Callers decide where to go
// afterwards — the user menu sends people home, while the route guard's
// "switch to open this page" keeps them where they are.
export function useSetActivePersona(): (persona: SwitchablePersona) => void {
  const membershipId = useAuthStore((s) => s.claims?.membership_id);
  const setActivePersona = usePersonaStore((s) => s.setActivePersona);

  return useCallback(
    (persona: SwitchablePersona) => {
      if (membershipId) setActivePersona(membershipId, persona);
    },
    [membershipId, setActivePersona],
  );
}
