import type { LucideIcon } from "lucide-react";

export type Persona = "admin" | "teacher" | "parent" | "student" | "bursar";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  // Shown on the module's ComingSoon placeholder page.
  description: string;
  personas: Persona[];
  // Unbuilt modules get a "Soon" badge in the sidebar.
  soon?: boolean;
}

export interface NavGroup {
  label: string;
  // Used as the accordion header icon (and the collapsed-rail flyout trigger)
  // for groups with more than one item. Single-item groups render flat.
  icon: LucideIcon;
  items: NavItem[];
}

const ADMIN_ONLY: Persona[] = ["admin"];

// `soon` defaults true (unbuilt module). Pass false for a live, built route.
export function adminItem(item: Omit<NavItem, "personas" | "soon">, soon = true): NavItem {
  return { ...item, personas: ADMIN_ONLY, soon };
}
