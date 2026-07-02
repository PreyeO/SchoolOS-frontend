import { BarChart3, Landmark } from "lucide-react";

import { adminItem, type NavGroup } from "./types";

export const insightsGroup: NavGroup = {
  label: "Insights",
  items: [
    adminItem({
      label: "Analytics",
      href: "/analytics",
      icon: BarChart3,
      description: "Explore trends across enrollment, attendance, results, and finance.",
    }),
    adminItem({
      label: "Government / EMIS Reports",
      href: "/gov-reports",
      icon: Landmark,
      description: "Generate the reports required for government and EMIS submissions.",
    }),
  ],
};
