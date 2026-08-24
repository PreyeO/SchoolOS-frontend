import { CalendarDays, PartyPopper, TriangleAlert, type LucideIcon } from "lucide-react";

import type { AnnouncementCategory } from "../types";

export interface CategoryMeta {
  value: AnnouncementCategory;
  label: string;
  // Shown under the radio in the composer, so the author picks by what the
  // notice IS rather than by guessing what the styling will do.
  hint: string;
  // Null for `general` — see below.
  icon: LucideIcon | null;
  // Tailwind classes for the badge on a card. Empty for `general`.
  badge: string;
  // Extra card border, for the one category that must be impossible to skim past.
  card: string;
}

// `general` is deliberately the plain one: no icon, no badge, no colour. It's
// the default, so most notices land here and the board stays calm — which is
// the only thing that keeps the other three meaningful. If everything can be
// urgent, nothing is.
//
// Colours come from the existing brand tokens rather than new ones, so a notice
// reads the same way as the rest of the app: grass for good news, amber for
// caution (the same pair used by the fee and term warnings), primary for
// something scheduled.
export const ANNOUNCEMENT_CATEGORIES: CategoryMeta[] = [
  {
    value: "general",
    label: "General",
    hint: "Routine notice. No highlight.",
    icon: null,
    badge: "",
    card: "",
  },
  {
    value: "celebration",
    label: "Celebration",
    hint: "Birthdays, results, congratulations.",
    icon: PartyPopper,
    badge: "border-grass/30 bg-grass/10 text-grass",
    card: "",
  },
  {
    value: "urgent",
    label: "Urgent",
    hint: "Closures, emergencies — needs acting on today.",
    icon: TriangleAlert,
    badge: "border-amber/40 bg-amber/15 text-ink",
    // The only category that changes the card itself. Urgent notices are read
    // while scrolling past, so the badge alone isn't enough.
    card: "border-amber/50 bg-amber/5",
  },
  {
    value: "event",
    label: "Event",
    hint: "Something happening on a date — PTA, sports day.",
    icon: CalendarDays,
    badge: "border-primary/30 bg-primary/10 text-primary",
    card: "",
  },
];

const BY_VALUE = new Map(ANNOUNCEMENT_CATEGORIES.map((c) => [c.value, c]));

// Falls back to `general` rather than throwing, so a category added to the
// backend enum later renders as a plain notice instead of breaking the board.
export function categoryMeta(value: string): CategoryMeta {
  return BY_VALUE.get(value as AnnouncementCategory) ?? ANNOUNCEMENT_CATEGORIES[0];
}
