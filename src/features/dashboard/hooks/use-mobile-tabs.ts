"use client";

import { Ellipsis, type LucideIcon } from "lucide-react";

import { MOBILE_TABS } from "@/data/nav/mobile-tabs";
import type { NavItem } from "@/data/navigation";
import { useActivePersona } from "@/lib/auth/use-active-persona";

import { useNavGroups } from "./use-nav-groups";

export interface ResolvedTab {
  href: string;
  label: string;
  icon: LucideIcon;
}

function leaves(items: NavItem[]): NavItem[] {
  return items.flatMap((item) => (item.items ? leaves(item.items) : [item]));
}

// The active persona's bottom-bar tabs, resolved against the nav groups the
// sidebar is showing right now. A tab whose route isn't in those groups is
// dropped rather than rendered, so the bar can never offer a screen the
// RouteAccessGuard would refuse — the same guarantee the sidebar has.
//
// Empty for personas without a bar (admin, student), which is how the shell
// knows not to render one or reserve space for it.
export function useMobileTabs(): ResolvedTab[] {
  const persona = useActivePersona();
  const groups = useNavGroups();
  const config = MOBILE_TABS[persona];
  if (!config) return [];

  const byHref = new Map(leaves(groups.flatMap((g) => g.items)).map((i) => [i.href, i]));

  return config.flatMap((tab): ResolvedTab[] => {
    if (tab.href === "more") return [{ href: "more", label: tab.label, icon: Ellipsis }];
    const item = byHref.get(tab.href);
    return item ? [{ href: tab.href, label: tab.label, icon: item.icon }] : [];
  });
}
