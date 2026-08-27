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
    // Marked `soon` because there is genuinely nothing to show yet, not because
    // the screen is unbuilt: attendance/views.py's get_queryset grants rows only
    // to an admin with view_attendance or a teacher, and returns an empty
    // queryset to everyone else — a silent 200, not a 403. There's also no
    // student filter in attendance/filters.py. Both need to land before this
    // can become a real screen; see docs/PROJECT.md's backend-gap list.
    parentItem({
      label: "Attendance",
      href: "/child/attendance",
      icon: CalendarCheck,
      description: "Your child's day-by-day attendance record.",
    }),
    parentItem({
      label: "Child profile",
      href: "/child/profile",
      icon: UserRound,
      description: "Your child's record as the school holds it.",
    }, false),
  ],
};
