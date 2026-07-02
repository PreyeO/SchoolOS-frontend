import { LayoutDashboard } from "lucide-react";

import type { NavGroup, Persona } from "./types";

const ALL_PERSONAS: Persona[] = ["admin", "teacher", "parent", "student", "bursar"];

export const overviewGroup: NavGroup = {
  label: "Overview",
  items: [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      description: "Your school's live overview — enrollment, fees, and attendance at a glance.",
      personas: ALL_PERSONAS,
    },
  ],
};
