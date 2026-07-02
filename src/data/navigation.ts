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

export function getNavGroupsForPersona(persona: Persona) {
  return NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.personas.includes(persona)),
  })).filter((group) => group.items.length > 0);
}
