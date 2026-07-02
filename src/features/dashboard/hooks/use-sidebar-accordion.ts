"use client";

import { useState } from "react";

import type { NavGroup } from "@/data/navigation";
import { isNavActive } from "../lib/is-nav-active";

function findActiveGroupLabel(groups: NavGroup[], pathname: string): string | null {
  const group = groups.find((g) => g.items.some((item) => isNavActive(item.href, pathname)));
  return group?.label ?? null;
}

export function useSidebarAccordion(groups: NavGroup[], pathname: string) {
  const [trackedPathname, setTrackedPathname] = useState(pathname);
  const [openGroup, setOpenGroup] = useState<string | null>(() => findActiveGroupLabel(groups, pathname));

  // Re-sync the open group on route change — adjusted during render (not an
  // effect) per React's "adjusting state when a prop changes" pattern, so it
  // doesn't trip the set-state-in-effect rule and doesn't clobber manual toggles.
  if (pathname !== trackedPathname) {
    setTrackedPathname(pathname);
    setOpenGroup(findActiveGroupLabel(groups, pathname));
  }

  function toggleGroup(label: string) {
    setOpenGroup((current) => (current === label ? null : label));
  }

  return { openGroup, toggleGroup };
}
