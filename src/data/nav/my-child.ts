import { CalendarCheck, GraduationCap, Receipt, Trophy, UserRound } from "lucide-react";

import { parentItem, type NavGroup } from "./types";

// Everything about the child the switcher has selected. Parent-only: an admin
// reaches the same records through the Students directory, where they can also
// act on them.
export const myChildGroup: NavGroup = {
  label: "My Child",
  icon: GraduationCap,
  items: [
    parentItem({
      label: "Results",
      href: "/child/results",
      icon: Trophy,
      description: "Subject scores, grades and class position, term by term.",
    }, false),
    parentItem({
      label: "Fees",
      href: "/child/fees",
      icon: Receipt,
      description: "What your child was billed this term, and what's left to pay.",
    }, false),
    parentItem({
      label: "Attendance",
      href: "/child/attendance",
      icon: CalendarCheck,
      description: "Your child's day-by-day attendance record.",
    }, false),
    parentItem({
      label: "Child profile",
      href: "/child/profile",
      icon: UserRound,
      description: "Your child's record as the school holds it.",
    }, false),
  ],
};
