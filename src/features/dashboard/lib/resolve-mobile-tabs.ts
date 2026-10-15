import { Ellipsis, type LucideIcon } from "lucide-react";

import { MAX_LINK_TABS, type MobileTab } from "@/data/nav/mobile-tabs";
import type { NavGroup, NavItem } from "@/data/navigation";

export interface ResolvedTab {
  href: string;
  label: string;
  icon: LucideIcon;
}

function leaves(items: NavItem[]): NavItem[] {
  return items.flatMap((item) => (item.items ? leaves(item.items) : [item]));
}

// A persona's tab config resolved against the nav groups the sidebar is
// showing. A tab whose route isn't in those groups is dropped rather than
// rendered, so the bar can never offer a screen the RouteAccessGuard would
// refuse — the same guarantee the sidebar has. What's left is capped at
// MAX_LINK_TABS, which is what makes the admin list a priority list rather
// than a fixed set. "more" always comes last.
//
// Pure, and kept apart from useMobileTabs, so it can be tested against the
// real nav registry without rendering anything.
export function resolveMobileTabs(config: MobileTab[] | undefined, groups: NavGroup[]): ResolvedTab[] {
  if (!config) return [];

  const byHref = new Map(leaves(groups.flatMap((g) => g.items)).map((i) => [i.href, i]));

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
