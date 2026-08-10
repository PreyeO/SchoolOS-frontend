import { overviewGroup } from "./nav/overview";
import { academicsGroup } from "./nav/academics";
import { peopleGroup } from "./nav/people";
import { financeGroup } from "./nav/finance";
import { communicationGroup } from "./nav/communication";
import { operationsGroup } from "./nav/operations";
import { insightsGroup } from "./nav/insights";
import { settingsGroup } from "./nav/settings";
import type { Persona } from "./nav/types";

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

// Personas are not exclusive — a user can be an admin and a teacher at the same
// school, and should see what either can do rather than whichever the token
// happened to list first. An item shows if any of the caller's personas match.
export function getNavGroupsForPersonas(personas: Persona[]) {
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.personas.some((p) => personas.includes(p))),
  })).filter((group) => group.items.length > 0);
}
