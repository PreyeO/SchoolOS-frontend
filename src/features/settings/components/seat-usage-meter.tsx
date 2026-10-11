"use client";

import type { SeatUsage } from "../api/seat-usage-api";

// From here the bar turns amber: close enough that an admin planning an
// intake should raise capacity first, not discover the limit mid-import.
const NEARLY_FULL = 0.9;

interface Props {
  usage: SeatUsage;
  capacity: number;
}

// "350 of 500 seats used", a bar, and what's left. Colour carries one
// message only — how close they are to being refused — so it stays brand
// primary until that matters.
export function SeatUsageMeter({ usage, capacity }: Props) {
  const used = usage.active + usage.suspended;
  const left = Math.max(capacity - used, 0);
  const ratio = capacity > 0 ? used / capacity : 1;
  const full = used >= capacity;
  const nearlyFull = !full && ratio >= NEARLY_FULL;
  const barColour = full ? "bg-destructive" : nearlyFull ? "bg-amber" : "bg-primary";

  return (
    <div className="space-y-2">
      <p className="font-display text-2xl font-bold tabular-nums text-ink">
        {used.toLocaleString()}
        <span className="text-base font-medium text-n-400"> / {capacity.toLocaleString()}</span>
        <span className="ml-2 text-sm font-normal text-n-500">seats used</span>
      </p>

      <div
        role="meter"
        aria-label="Student seats used"
        aria-valuemin={0}
        aria-valuemax={capacity}
        aria-valuenow={used}
        aria-valuetext={`${used} of ${capacity} seats used`}
        className="h-2 w-full max-w-md overflow-hidden rounded-full bg-n-100"
      >
        <div
          className={`h-full rounded-full transition-[width] motion-reduce:transition-none ${barColour}`}
          style={{ width: `${Math.min(ratio, 1) * 100}%` }}
        />
      </div>

      <p className={`text-xs ${full ? "font-medium text-destructive" : nearlyFull ? "font-medium text-ink" : "text-n-500"}`}>
        {full
          ? "Full. New students and CSV imports will be refused until capacity is raised."
          : `${left.toLocaleString()} ${left === 1 ? "seat" : "seats"} left${nearlyFull ? " — raise capacity before your next intake." : "."}`}
      </p>

      {/* What counts, stated once: a withdrawn or graduated student is the
          usual source of "why is the number lower than my register?". */}
      <p className="max-w-md text-xs text-n-400">
        Enrolled and suspended students use a seat
        {usage.suspended > 0 ? ` (${usage.suspended} suspended)` : ""}. Students who have
        graduated, transferred, withdrawn or been expelled don&rsquo;t.
      </p>
    </div>
  );
}
