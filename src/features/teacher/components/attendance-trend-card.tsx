import type { TrendPoint } from "../lib/attendance-derivations";
import { AttendanceTrendChart } from "./attendance-trend-chart";

interface Props {
  trend: TrendPoint[];
  hasAnyRecords: boolean;
}

// The rate across the teacher's marked days.
//
// Marked days, not calendar days — a school week has gaps, and plotting an
// unmarked day as zero would invent absences. That's also why a single point
// shows copy instead of a chart: one dot is not a trend, and drawing it as one
// implies a line that was never measured.
export function AttendanceTrendCard({ trend, hasAnyRecords }: Props) {
  return (
    <section className="rounded-xl border border-n-200 bg-white p-5 lg:col-span-2">
      <h2 className="font-display text-base font-semibold text-ink">
        Attendance across your classes
      </h2>
      <p className="mt-0.5 text-xs text-n-400">
        {hasAnyRecords ? "Your last 10 marked days" : "Once you start marking registers"}
      </p>
      {trend.length > 1 ? (
        <div className="mt-3">
          <AttendanceTrendChart data={trend} />
        </div>
      ) : (
        <div className="mt-6 grid place-items-center py-10 text-center">
          <p className="max-w-60 text-sm text-n-400">
            {trend.length === 1
              ? "One day marked so far — the trend appears once there are two."
              : "No registers taken yet. The trend builds as you mark them."}
          </p>
        </div>
      )}
    </section>
  );
}
