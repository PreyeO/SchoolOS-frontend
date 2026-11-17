import {
  Settings,
  Building2,
  CalendarRange,
  SlidersHorizontal,
  Coins,
  Wallet,
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
      permission: "view_fees",
    }, false),
    // Was a "Payment Integrations" placeholder promising online fee
    // collection, which has no backend. The route now holds the SMS wallet;
    // /settings/payments/topup-complete (the gateway's return) resolves here too.
    adminItem({
      label: "SMS Wallet",
      href: "/settings/payments",
      icon: Wallet,
      description: "Buy SMS credits for texting parents, and see what they've been spent on.",
      permission: "manage_wallet",
    }, false),
    adminItem({
      label: "Roles & Permissions",
      href: "/settings/roles",
      icon: ShieldCheck,
      description: "Create custom roles and control what each staff member can access.",
      permission: "manage_roles",
    }, false),
    adminItem({
      label: "Audit Log",
      href: "/settings/audit-log",
      icon: ScrollText,
      description: "See who changed what across your school, and when.",
      permission: "view_audit_logs",
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
      // Names only what exists. There's no gateway, no plan-change flow and no
      // invoice list on the backend — capacity is the one thing a school can
      // actually change here, so promising "plans and invoices" would send
      // admins looking for screens that aren't there.
      description: "Your school's access status and student capacity.",
    }, false),
    // Unbuilt, so hidden from the sidebar (soon defaults true) — but the
    // ComingSoon page still renders this description, and it promised
    // "exports" that no endpoint provides and "NDPA compliance settings" that
    // aren't a thing. Named for what such a screen would actually do.
    adminItem({
      label: "Data & Privacy",
      href: "/settings/privacy",
      icon: Lock,
      description: "Data retention and privacy controls for your school.",
    }),
  ],
};
