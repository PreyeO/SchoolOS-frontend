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
import { PLATFORM_NAV_GROUPS } from "./nav/platform";
import type { NavGroup, NavItem, Persona } from "./nav/types";

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

// Longest match wins within the groups given, so /settings/grading picks the
// grading item rather than /settings, and /students/<id> resolves to /students.
function matchIn(groups: NavGroup[], pathname: string): NavItem | undefined {
  let best: NavItem | undefined;
  for (const group of groups) {
    for (const item of flattenLeaves(group.items)) {
      const matches = item.href === pathname || pathname.startsWith(`${item.href}/`);
      if (matches && (!best || item.href.length > best.href.length)) best = item;
    }
  }
  return best;
}

// Which row the current route belongs to — used for sidebar highlighting and
// the topbar title.
//
// Searches the PLATFORM groups too, and that is the whole point. They are
// deliberately absent from NAV_GROUPS because that registry is persona-filtered
// and knows nothing about platform admins — but the platform sidebar still has
// to know which of its own rows is open. Without them every /platform/* route
// matched nothing, so no row ever highlighted and the accordion collapsed its
// open group on each navigation, because useSidebarAccordion re-derives the
// open group from exactly this function.
//
// Matching only. Access is decided by canAccessPath below, which stays on
// NAV_GROUPS — a platform route must not become reachable just because it can
// now be identified.
export function findNavItemForPath(pathname: string) {
  return matchIn([...NAV_GROUPS, ...PLATFORM_NAV_GROUPS], pathname);
}

// The caller's school permissions, or null when they aren't known yet.
//
// The distinction matters: permissions arrive from /auth/me/ over the network,
// so there is a window on first load where the answer is "not yet" rather than
// "no". Treating that as denial would blank the sidebar on every fresh login
// and then refill it. Unknown means allow — the API stays the authority.
export type PermissionSet = string[] | null;

function itemAllowed(item: NavItem, personas: Persona[], permissions: PermissionSet): boolean {
  const matched = item.personas.filter((p) => personas.includes(p));
  if (matched.length === 0) return false;

  // Access earned through any non-admin persona stands on its own — a teacher
  // holds no admin role, so an admin permission has nothing to say about it.
  if (matched.some((p) => p !== "admin")) return true;
  if (!item.permission || permissions === null) return true;

  return permissions.includes(item.permission);
}

// Whether this caller may open this path.
//
// A path with no nav item is deliberately allowed: detail pages, the onboarding
// wizard and the platform area aren't in the sidebar, and denying by default
// would lock people out of routes this registry was never meant to describe.
export function canAccessPath(
  pathname: string,
  personas: Persona[],
  permissions: PermissionSet = null,
): boolean {
  // matchIn, not findNavItemForPath: access is a school-nav question. Letting
  // a platform row answer it would have /platform/* gated by the filler
  // personas on PLATFORM_NAV_GROUPS rather than by PlatformGuard.
  const item = matchIn(NAV_GROUPS, pathname);
  if (!item) return true;
  return itemAllowed(item, personas, permissions);
}

// Whether this item appears in the sidebar at all.
//
// Unbuilt modules are out of the MVP, so they're hidden rather than shown with
// a "Soon" badge. Checked before shipping this: all 24 `soon` items render only
// a ComingSoon placeholder, and all 40 of the rest are real screens, so the
// flag is accurate in both directions and nothing that works gets hidden.
//
// Deliberately here and not in itemAllowed, which also backs canAccessPath:
// these routes should still resolve if someone follows an old bookmark, and
// land on the placeholder that explains itself. Blocking them there would
// instead show "This page isn't available to your account", which blames the
// reader's permissions for a feature that simply doesn't exist yet. What's
// being removed is the invitation to click, not the page.
function isVisible(item: NavItem, personas: Persona[], permissions: PermissionSet): boolean {
  return !item.soon && itemAllowed(item, personas, permissions);
}

// Recurses into a groupedItem()'s nested items rather than filtering by the
// wrapper's own (unioned, and so over-permissive) personas — a nested item
// survives only on its own narrower personas, same as a flat one, and the
// wrapper survives only if at least one nested item still does.
function filterItemsFor(items: NavItem[], personas: Persona[], permissions: PermissionSet): NavItem[] {
  return items
    .map((item) =>
      item.items ? { ...item, items: filterItemsFor(item.items, personas, permissions) } : item,
    )
    .filter((item) => (item.items ? item.items.length > 0 : isVisible(item, personas, permissions)));
}

// Personas are not exclusive — a user can be an admin and a teacher at the same
// school, and should see what either can do rather than whichever the token
// happened to list first. An item shows if any of the caller's personas match,
// and — for access coming via the admin persona — if the role carries the
// permission that item's screen needs.
export function getNavGroupsForPersonas(personas: Persona[], permissions: PermissionSet = null) {
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: filterItemsFor(group.items, personas, permissions),
  })).filter((group) => group.items.length > 0);
}
