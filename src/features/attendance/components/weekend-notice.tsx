import { formatDate } from "@/lib/text/format-date";

import { weekendDayName } from "../lib/weekend";

// Shown above a register dated on a weekend. A school reported a teacher
// marking Saturday by mistake, and the backend has no way to clear a register
// yet, so the cheapest fix is to make the date impossible to miss.
//
// A warning, not a block: some schools do hold Saturday classes or lessons.
export function WeekendNotice({ date }: { date: string }) {
  const day = weekendDayName(date);
  if (!day) return null;

  return (
    <p role="status" className="rounded-lg border border-amber/40 bg-amber/10 px-3.5 py-2.5 text-sm text-ink">
      <span className="font-medium">
        {day}, {formatDate(date)} is a weekend.
      </span>{" "}
      Only mark this register if your school held classes that day — check the date above if not.
    </p>
  );
}
