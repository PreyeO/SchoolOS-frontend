import type { Persona } from "./types";

// The phone bottom bar, per persona. Only parents and teachers have one: they
// use SchoolOS on a phone, daily, across a handful of screens. Admins (~48
// screens, mostly on a laptop) and students keep the drawer alone for now.
//
// Each tab is an href that already exists in the nav registry. The icon is
// borrowed from that registry item (see useMobileTabs), so a tab can't point
// at a route the sidebar doesn't offer or show a different icon for it.
// Labels are shortened for a 5-across bar, which is why they're set here.
//
// "more" opens the full drawer — the same menu the topbar's hamburger opens —
// for everything that didn't make the bar.
export type MobileTab = { href: string; label: string } | { href: "more"; label: string };

export const MOBILE_TABS: Partial<Record<Persona, MobileTab[]>> = {
  // A parent has exactly five destinations worth a tab; Child profile stays in
  // the drawer. No "More": the hamburger still opens the drawer for the rest.
  parent: [
    { href: "/dashboard", label: "Home" },
    { href: "/child/results", label: "Results" },
    { href: "/child/fees", label: "Fees" },
    { href: "/child/attendance", label: "Attendance" },
    { href: "/announcements", label: "Notices" },
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
};
