"use client";

import { Ellipsis, type LucideIcon } from "lucide-react";

import { MAX_LINK_TABS, MOBILE_TABS } from "@/data/nav/mobile-tabs";
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
// RouteAccessGuard would refuse — the same guarantee the sidebar has. What's
// left is capped at MAX_LINK_TABS, which is what makes the admin list a
// priority list rather than a fixed set.
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
  const config = MOBILE_TABS[persona];
  if (!config) return [];

  const byHref = new Map(leaves(groups.flatMap((g) => g.items)).map((i) => [i.href, i]));

  // Accessible link tabs in priority order, capped; "more" always last.
  const links = config.flatMap((tab): ResolvedTab[] => {
    if (tab.href === "more") return [];
    const item = byHref.get(tab.href);
    return item ? [{ href: tab.href, label: tab.label, icon: item.icon }] : [];
  });
  const more = config.find((tab) => tab.href === "more");

  return [
    ...links.slice(0, MAX_LINK_TABS),
    ...(more ? [{ href: "more", label: more.label, icon: Ellipsis }] : []),
  ];
}
