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
  items: NavItem[];
}

const ADMIN_ONLY: Persona[] = ["admin"];

export function adminItem(item: Omit<NavItem, "personas" | "soon">): NavItem {
  return { ...item, personas: ADMIN_ONLY, soon: true };
}
