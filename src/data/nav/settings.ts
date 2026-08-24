import {
  Settings,
  Building2,
  CalendarRange,
  SlidersHorizontal,
  Coins,
  Plug,
  ShieldCheck,
  FileStack,
  BadgeDollarSign,
  Lock,
  ScrollText,
} from "lucide-react";

import { adminItem, type NavGroup } from "./types";

export const settingsGroup: NavGroup = {
  label: "Settings",
  icon: Settings,
  items: [
    adminItem({
      label: "School Profile",
      href: "/settings/school",
      icon: Building2,
      description: "Update your school's details, logo, and brand colors.",
    }, false),
    adminItem({
      label: "Sessions & Terms",
      href: "/settings/sessions",
      icon: CalendarRange,
      description: "Manage academic sessions, terms, and their start and end dates.",
    }, false),
    adminItem({
      label: "Grading Configuration",
      href: "/settings/grading",
      icon: SlidersHorizontal,
      description: "Define grade boundaries, remarks, and how scores are computed.",
    }, false),
    adminItem({
      label: "Behaviour Traits",
      href: "/settings/behaviour-traits",
      icon: SlidersHorizontal,
      description: "Define the affective and psychomotor traits teachers rate for report cards.",
    }, false),
    adminItem({
      label: "Fee Structure",
      href: "/settings/fees",
      icon: Coins,
      description: "Configure fee items, amounts, and class-based fee plans.",
    }, false),
    adminItem({
      label: "Payment Integrations",
      href: "/settings/payments",
      icon: Plug,
      description: "Connect payment gateways to accept fees online.",
    }),
    adminItem({
      label: "Roles & Permissions",
      href: "/settings/roles",
      icon: ShieldCheck,
      description: "Create custom roles and control what each staff member can access.",
    }, false),
    adminItem({
      label: "Audit Log",
      href: "/settings/audit-log",
      icon: ScrollText,
      description: "See who changed what across your school, and when.",
    }, false),
    adminItem({
      label: "Report Card Templates",
      href: "/settings/report-cards",
      icon: FileStack,
      description: "Design and customize the layout of your school's report cards.",
    }, false),
    adminItem({
      label: "Subscription & Billing",
      href: "/settings/subscription",
      icon: BadgeDollarSign,
      description: "Manage your SchoolOS plan, billing details, and invoices.",
    }),
    adminItem({
      label: "Data & Privacy (NDPA)",
      href: "/settings/privacy",
      icon: Lock,
      description: "Manage data retention, exports, and NDPA compliance settings.",
    }),
  ],
};
