import {
  Activity,
  Building2,
  Inbox,
  LayoutDashboard,
  ScrollText,
  ShieldCheck,
  TrendingUp,
  Users2,
} from "lucide-react";

import type { NavGroup } from "./types";

// SchoolOS staff navigation.
//
// Deliberately NOT registered in NAV_GROUPS (src/data/navigation.ts). That
// registry is persona-filtered for school members, and its filter has no
// concept of a platform admin: getNavGroupsForPersonas falls back to ["admin"]
// on an empty persona list, which would show a platform admin the entire
// school-admin sidebar — every link 403ing. So the platform sidebar maps this
// constant directly and never touches useNavGroups or canAccessPath.
//
// `personas: ["admin"]` on each item is filler to satisfy NavItem's shape. It
// is never read: nothing routes this constant through the persona filter, and
// access to /platform/* is enforced by PlatformGuard on the token's
// is_platform_admin claim, not by the nav registry.
const PLATFORM_ONLY = ["admin"] as const;

function item(
  label: string,
  href: string,
  icon: NavGroup["items"][number]["icon"],
  description: string,
) {
  return { label, href, icon, description, personas: [...PLATFORM_ONLY], soon: false };
}

export const PLATFORM_NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    icon: LayoutDashboard,
    items: [
      item("Dashboard", "/platform", LayoutDashboard, "Schools, revenue and what needs attention."),
    ],
  },
  {
    label: "Schools",
    icon: Building2,
    items: [
      item("All schools", "/platform/schools", Building2, "Every school on the platform and its access status."),
      item("Demo requests", "/platform/demo-requests", Inbox, "Schools that asked to join the pilot."),
      item("Revenue", "/platform/revenue", TrendingUp, "Projected termly revenue, per school."),
    ],
  },
  {
    label: "People",
    icon: Users2,
    items: [
      item("Directory", "/platform/people", Users2, "Students, teachers, parents and admins across every school."),
      item("SchoolOS staff", "/platform/staff", ShieldCheck, "Platform administrators and their roles."),
    ],
  },
  {
    label: "Activity",
    icon: ScrollText,
    items: [
      item("School activity", "/platform/activity", Activity, "Which schools are using SchoolOS, and which have gone quiet."),
      item("Audit log", "/platform/audit", ScrollText, "Every recorded change, across every school."),
    ],
  },
];
