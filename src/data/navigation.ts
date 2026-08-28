import { overviewGroup } from "./nav/overview";
import { myChildGroup } from "./nav/my-child";
import { mySchoolGroup } from "./nav/my-school";
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
  // Directly after Overview: for a parent these are the only other screens they
  // have, so burying them below the admin-only groups would leave their sidebar
  // looking empty at the top.
  myChildGroup,
  mySchoolGroup,
  academicsGroup,
  peopleGroup,
  financeGroup,
  communicationGroup,
  operationsGroup,
  insightsGroup,
  settingsGroup,
];

// Expands any groupedItem() wrapper into its nested items, dropping the
// wrapper itself — it shares its href with one of its own children (see
// groupedItem in ./nav/types) and is never a distinct route, so leaving it in
// would only add a spurious, over-broad candidate to an exact or
// longest-prefix match below.
function flattenLeaves(items: NavItem[]): NavItem[] {
  return items.flatMap((item) => (item.items ? flattenLeaves(item.items) : [item]));
}

export function getNavItemByHref(href: string) {
  for (const group of NAV_GROUPS) {
    const item = flattenLeaves(group.items).find((i) => i.href === href);
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
    for (const item of flattenLeaves(group.items)) {
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

// Recurses into a groupedItem()'s nested items rather than filtering by the
// wrapper's own (unioned, and so over-permissive) personas — a nested item
// survives only on its own narrower personas, same as a flat one, and the
// wrapper survives only if at least one nested item still does.
function filterItemsForPersonas(items: NavItem[], personas: Persona[]): NavItem[] {
  return items
    .map((item) => (item.items ? { ...item, items: filterItemsForPersonas(item.items, personas) } : item))
    .filter((item) => (item.items ? item.items.length > 0 : item.personas.some((p) => personas.includes(p))));
}

// Personas are not exclusive — a user can be an admin and a teacher at the same
// school, and should see what either can do rather than whichever the token
// happened to list first. An item shows if any of the caller's personas match.
export function getNavGroupsForPersonas(personas: Persona[]) {
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: filterItemsForPersonas(group.items, personas),
  })).filter((group) => group.items.length > 0);
}
