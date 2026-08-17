import { overviewGroup } from "./nav/overview";
import { academicsGroup } from "./nav/academics";
import { peopleGroup } from "./nav/people";
import { financeGroup } from "./nav/finance";
import { communicationGroup } from "./nav/communication";
import { operationsGroup } from "./nav/operations";
import { insightsGroup } from "./nav/insights";
import { settingsGroup } from "./nav/settings";
import type { NavItem, Persona } from "./nav/types";

export type { NavGroup, NavItem, Persona } from "./nav/types";
export { isPersona } from "./nav/types";

export const NAV_GROUPS = [
  overviewGroup,
  academicsGroup,
  peopleGroup,
  financeGroup,
  communicationGroup,
  operationsGroup,
  insightsGroup,
  settingsGroup,
];

export function getNavItemByHref(href: string) {
  for (const group of NAV_GROUPS) {
    const item = group.items.find((i) => i.href === href);
    if (item) return item;
  }
  return undefined;
}

// The nav item governing a pathname, including nested routes: /students/<id>
// resolves to the /students item. Longest match wins, so /settings/grading picks
// the grading item rather than /settings.
//
// This turns the nav's persona declarations into the single source of truth for
// access, rather than a second list that could drift from it.
export function findNavItemForPath(pathname: string) {
  let best: NavItem | undefined;
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      const matches = item.href === pathname || pathname.startsWith(`${item.href}/`);
      if (matches && (!best || item.href.length > best.href.length)) best = item;
    }
  }
  return best;
}

// Whether these personas may open this path.
//
// A path with no nav item is deliberately allowed: detail pages, the onboarding
// wizard and the platform area aren't in the sidebar, and denying by default
// would lock people out of routes this registry was never meant to describe.
export function canAccessPath(pathname: string, personas: Persona[]): boolean {
  const item = findNavItemForPath(pathname);
  if (!item) return true;
  return item.personas.some((p) => personas.includes(p));
}

// Personas are not exclusive — a user can be an admin and a teacher at the same
// school, and should see what either can do rather than whichever the token
// happened to list first. An item shows if any of the caller's personas match.
export function getNavGroupsForPersonas(personas: Persona[]) {
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.personas.some((p) => personas.includes(p))),
  })).filter((group) => group.items.length > 0);
}
