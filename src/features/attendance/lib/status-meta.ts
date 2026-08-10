import type { AttendanceStatus } from "../types";

interface StatusMeta {
  label: string;
  // Single letter for the compact segmented control on narrow screens.
  short: string;
  // Selected-state classes. Semantic colours, deliberately not the school's
  // brand accent — "present" must read the same in every school's palette.
  selected: string;
  dot: string;
}

export const STATUS_META: Record<AttendanceStatus, StatusMeta> = {
  present: {
    label: "Present",
    short: "P",
    selected: "border-emerald-500/40 bg-emerald-500/15 text-emerald-900",
    dot: "bg-emerald-500",
  },
  absent: {
    label: "Absent",
    short: "A",
    selected: "border-clay/50 bg-clay/15 text-clay",
    dot: "bg-clay",
  },
  late: {
    label: "Late",
    short: "L",
    selected: "border-amber/50 bg-amber/20 text-ink",
    dot: "bg-amber",
  },
  excused: {
    label: "Excused",
    short: "E",
    selected: "border-sky-500/40 bg-sky-500/15 text-sky-900",
    dot: "bg-sky-600",
  },
};
