import { Users, Briefcase, Users2, UserPlus } from "lucide-react";

import { adminItem, type NavGroup } from "./types";

export const peopleGroup: NavGroup = {
  label: "People",
  items: [
    adminItem({
      label: "Students",
      href: "/students",
      icon: Users,
      description: "Manage student records, enrollment, class placement, and academic history.",
    }),
    adminItem({
      label: "Staff",
      href: "/staff",
      icon: Briefcase,
      description: "Manage staff profiles, roles, subjects taught, and employment records.",
    }),
    adminItem({
      label: "Parents & Guardians",
      href: "/parents",
      icon: Users2,
      description: "Manage parent and guardian accounts and their linked children.",
    }),
    adminItem({
      label: "Admissions",
      href: "/admissions",
      icon: UserPlus,
      description: "Run online admissions — applications, entrance tests, and offers.",
    }),
  ],
};
