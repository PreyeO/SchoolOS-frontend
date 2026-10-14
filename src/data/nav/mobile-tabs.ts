import type { Persona } from "./types";

// The phone bottom bar, per persona — every persona has one.
//
// A list may be longer than the bar: useMobileTabs drops any tab the person
// can't open, then keeps the first MAX_LINK_TABS that are left, then "more".
// That turns the admin list into a PRIORITY list, because different admins
// hold different roles: a principal gets Students · Fees · Review, while a
// bursar without view_students gets Fees · Review · Notices, and nobody gets
// a gap or a tab that 403s.
//
// Each tab is an href that already exists in the nav registry. The icon is
// borrowed from that registry item (see useMobileTabs), so a tab can't point
// at a route the sidebar doesn't offer or show a different icon for it.
// Labels are shortened for a 5-across bar, which is why they're set here.
//
// "more" opens the full drawer for everything that didn't make the bar. Every
// persona with a bar ends in "more", and the topbar drops its hamburger for
// them (see AppTopbar) — two buttons opening the same menu read as two menus.
export type MobileTab = { href: string; label: string } | { href: "more"; label: string };

// Link tabs before "More" — five across in total, the most that stays
// legible at 360px.
export const MAX_LINK_TABS = 4;

export const MOBILE_TABS: Partial<Record<Persona, MobileTab[]>> = {
  // Results and fees are what parents open the app for. Attendance and Child
  // profile live under More.
  parent: [
    { href: "/dashboard", label: "Home" },
    { href: "/child/results", label: "Results" },
    { href: "/child/fees", label: "Fees" },
    { href: "/announcements", label: "Notices" },
    { href: "more", label: "More" },
  ],
  // The three things a teacher does on their feet in a classroom, plus home.
  // Behaviour, broadsheet, leaderboard and notices sit under More.
  teacher: [
    { href: "/dashboard", label: "Home" },
    { href: "/attendance", label: "Register" },
    { href: "/results", label: "Scores" },
    { href: "/my-classes", label: "Classes" },
    { href: "more", label: "More" },
  ],
  // Same shape as a parent's. Subjects and Attendance live under More.
  student: [
    { href: "/dashboard", label: "Home" },
    { href: "/my/results", label: "Results" },
    { href: "/my/fees", label: "Fees" },
    { href: "/announcements", label: "Notices" },
    { href: "more", label: "More" },
  ],
  // A priority list (see above). What admins do on a phone is look things up
  // and approve: find a student, check who owes, review submitted scores,
  // post a notice. Setup and configuration happen on a laptop, under More.
  admin: [
    { href: "/dashboard", label: "Home" },
    { href: "/students", label: "Students" },
    { href: "/fees", label: "Fees" },
    { href: "/results/review", label: "Review" },
    { href: "/announcements", label: "Notices" },
    { href: "more", label: "More" },
  ],
};
