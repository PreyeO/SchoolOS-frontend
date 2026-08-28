import { BookOpen, CalendarCheck, GraduationCap, Receipt, Trophy } from "lucide-react";

import { studentItem, type NavGroup } from "./types";

// A student's own record. Student-only: staff reach the same data through the
// Students directory and the results screens, where they can also act on it.
export const mySchoolGroup: NavGroup = {
  label: "My School",
  icon: GraduationCap,
  items: [
    studentItem({
      label: "My results",
      href: "/my/results",
      icon: Trophy,
      description: "Your scores, grades and class position for each term.",
    }, false),
    studentItem({
      label: "My subjects",
      href: "/my/subjects",
      icon: BookOpen,
      description: "What your class is taught this session, and by whom.",
    }, false),
    studentItem({
      label: "My fees",
      href: "/my/fees",
      icon: Receipt,
      description: "What you were billed this term, and what's left to pay.",
    }, false),
    // Same backend gap as the parent's attendance item: AttendanceRecordViewSet
    // returns an empty queryset to anyone who isn't an admin with
    // view_attendance or a teacher, and there's no per-student filter — so a
    // student sees a silent empty 200, not a 403. Verified live.
    // See docs/asks/parent-portal-gaps.md.
    studentItem({
      label: "My attendance",
      href: "/my/attendance",
      icon: CalendarCheck,
      description: "Your day-by-day attendance record.",
    }),
  ],
};
