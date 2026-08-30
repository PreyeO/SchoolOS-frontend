import { UsersRound, Users, Briefcase, Users2, UserCog, UserPlus, UserRoundPlus } from "lucide-react";

import { adminItem, type NavGroup } from "./types";

export const peopleGroup: NavGroup = {
  label: "People",
  icon: UsersRound,
  items: [
    adminItem({
      label: "Students",
      href: "/students",
      icon: Users,
      description: "Manage student records, enrollment, class placement, and academic history.",
      permission: "view_students",
    }, false),
    adminItem({
      label: "Teachers",
      href: "/staff",
      icon: Briefcase,
      description: "Manage teacher profiles, subjects taught, and employment records.",
      permission: "view_staff",
    }, false),
    adminItem({
      label: "School Admins",
      href: "/admins",
      icon: UserCog,
      description: "See your school's admin staff and manage which role each one holds.",
      permission: "view_staff",
    }, false),
    adminItem({
      label: "Parents & Guardians",
      href: "/parents",
      icon: Users2,
      description: "Manage parent and guardian accounts and their linked children.",
      permission: "view_parents",
    }, false),
    adminItem({
      label: "Admissions",
      href: "/admissions",
      icon: UserPlus,
      description: "Run online admissions — applications, entrance tests, and offers.",
    }),
    adminItem(
      {
        label: "Invitations",
        href: "/invitations",
        icon: UserRoundPlus,
        description: "Invite school admins, teachers, and parents, or add students directly.",
      },
      false,
    ),
  ],
};
