import type { LucideIcon } from "lucide-react";

export type Persona = "admin" | "teacher" | "parent" | "student" | "bursar";

const KNOWN_PERSONAS: Persona[] = ["admin", "teacher", "parent", "student", "bursar"];

// The JWT also carries "owner", which is an admin flavour rather than a nav
// audience — an owner always has "admin" alongside it, so dropping unknowns here
// is safe and keeps the nav from having to know about role tiers.
export function isPersona(value: string): value is Persona {
  return (KNOWN_PERSONAS as string[]).includes(value);
}

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  // Shown on the module's ComingSoon placeholder page.
  description: string;
  personas: Persona[];
  // Unbuilt modules get a "Soon" badge in the sidebar.
  soon?: boolean;
  // A related cluster shown nested under this one and expanded in place,
  // instead of every item sitting flat in the parent group. Present only on
  // disclosure items built with groupedItem() — href on those is a shared
  // route prefix used for active/open-group detection (see isNavActive in
  // the sidebar), not a page of its own. getNavItemByHref and
  // findNavItemForPath resolve to the nested leaf rather than this wrapper.
  items?: NavItem[];
}

export interface NavGroup {
  label: string;
  // Used as the accordion header icon (and the collapsed-rail flyout trigger)
  // for groups with more than one item. Single-item groups render flat.
  icon: LucideIcon;
  items: NavItem[];
}

const ADMIN_ONLY: Persona[] = ["admin"];
const ADMIN_AND_TEACHER: Persona[] = ["admin", "teacher"];
const TEACHER_ONLY: Persona[] = ["teacher"];

// `soon` defaults true (unbuilt module). Pass false for a live, built route.
export function adminItem(item: Omit<NavItem, "personas" | "soon">, soon = true): NavItem {
  return { ...item, personas: ADMIN_ONLY, soon };
}

// Modules both run: a teacher does the work, an admin oversees it. Attendance is
// the built example — teachers mark, admins review the same screen read-only.
export function staffItem(item: Omit<NavItem, "personas" | "soon">, soon = true): NavItem {
  return { ...item, personas: ADMIN_AND_TEACHER, soon };
}

// Scoped to the signed-in teacher's own work, so it has no meaning for an admin.
export function teacherItem(item: Omit<NavItem, "personas" | "soon">, soon = true): NavItem {
  return { ...item, personas: TEACHER_ONLY, soon };
}

// A disclosure item: rendered as a toggle that expands its own nested items
// in place rather than a link, so a cluster of related screens (e.g. every
// results-related page) can sit under one row instead of five flat ones.
// `personas` is the union of the nested items' own personas — it exists only
// so a persona-filtered render can decide whether this row has anything left
// to show, never to gate a route directly (each nested item still carries
// its real, narrower personas for that).
export function groupedItem(item: Omit<NavItem, "personas" | "soon"> & { items: NavItem[] }): NavItem {
  return {
    ...item,
    personas: Array.from(new Set(item.items.flatMap((i) => i.personas))),
  };
}
