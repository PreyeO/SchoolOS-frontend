"use client";

import { MOBILE_TABS } from "@/data/nav/mobile-tabs";
import { useActivePersona } from "@/lib/auth/use-active-persona";

import { resolveMobileTabs, type ResolvedTab } from "../lib/resolve-mobile-tabs";
import { useNavGroups } from "./use-nav-groups";

export type { ResolvedTab } from "../lib/resolve-mobile-tabs";

// The active persona's bottom-bar tabs, resolved against the nav groups the
// sidebar is showing right now (see resolveMobileTabs for the rules).
//
// While /me is still loading, permissions are unknown and every admin tab
// counts as allowed (the sidebar does the same), so a role without
// view_students sees its bar settle once, the moment /me answers.
//
// Empty for a persona with no config, which is how the shell knows not to
// render a bar or reserve space for it.
export function useMobileTabs(): ResolvedTab[] {
  const persona = useActivePersona();
  const groups = useNavGroups();
  return resolveMobileTabs(MOBILE_TABS[persona], groups);
}
