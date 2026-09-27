import { cn } from "@/lib/utils";

import type { RankedRow } from "../hooks/use-leaderboard";

interface Props {
  rows: RankedRow[];
  // "%" for an overall average, "" for a raw subject total.
  unit: string;
  showArm: boolean;
}

// Ranked list rather than a table: one line per student, read top-down.
//
// The top three get a filled primary badge and everything else a plain one —
// deliberately not gold/silver/bronze, which would be the only place in the app
// introducing colours outside the school's own palette.
export function LeaderboardTable({ rows, unit, showArm }: Props) {
  return (
    <ul className="divide-y divide-n-100">
      {rows.map((row) => (
        <li key={row.studentId} className="flex items-center gap-3 px-5 py-2.5">
          <span
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums",
              row.rank <= 3 ? "bg-primary text-white" : "bg-n-100 text-n-500",
            )}
          >
            {row.rank}
          </span>
          {/* Wraps on a phone, truncates from sm up. The second line carries the
              arm as well when ranking across a class ("gda/0675/2026 · Primary 3
              A"), which is wider than the space left beside the rank, grade and
              score, and was cut off mid-way. */}
          <span className="min-w-0 flex-1">
            <span className="block text-sm text-ink sm:truncate">
              {row.student.user.first_name} {row.student.user.last_name}
            </span>
            <span className="block font-mono text-[11px] text-n-400 sm:truncate">
              {row.student.admission_number}
              {showArm && row.armLabel && <span className="ml-1.5">· {row.armLabel}</span>}
            </span>
          </span>
          {row.grade && (
            <span className="shrink-0 rounded-full border border-n-200 px-2 py-0.5 text-[11px] text-n-600">
              {row.grade}
            </span>
          )}
          <span className="shrink-0 text-sm font-medium tabular-nums text-ink">
            {row.score}
            {unit}
          </span>
        </li>
      ))}
    </ul>
  );
}
