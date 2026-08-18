// Pure derivations over attendance records, split out of useTeacherOverview.
// No hooks and no fetching — just the shaping the dashboard's trend chart and
// "needs attention" list depend on, which makes them readable in isolation.

import { armDisplayName } from "@/lib/school/arm-display-name";
import type { AttendanceRecord } from "@/features/attendance/types";
export interface TrendPoint {
  date: string;
  label: string;
  rate: number;
  present: number;
  total: number;
}

export interface AbsenceEntry {
  studentId: string;
  name: string;
  admissionNumber: string;
  className: string;
  absences: number;
}

export const PRESENT_STATUSES = new Set(["present", "late"]);

// How many marked days the trend covers. Not calendar days — a school week has
// gaps, and plotting unmarked days as zero would invent absences.
const TREND_DAYS = 10;
const MAX_AT_RISK = 5;

export function buildTrend(records: AttendanceRecord[]): TrendPoint[] {
  const byDate = new Map<string, { present: number; total: number }>();
  records.forEach((r) => {
    const bucket = byDate.get(r.date) ?? { present: 0, total: 0 };
    bucket.total += 1;
    if (PRESENT_STATUSES.has(r.status)) bucket.present += 1;
    byDate.set(r.date, bucket);
  });

  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-TREND_DAYS)
    .map(([date, { present, total }]) => ({
      date,
      label: new Date(`${date}T00:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short" }),
      rate: total > 0 ? Math.round((present / total) * 100) : 0,
      present,
      total,
    }));
}

export function buildAtRisk(records: AttendanceRecord[]): AbsenceEntry[] {
  const tally = new Map<string, AbsenceEntry>();
  records
    .filter((r) => r.status === "absent")
    .forEach((r) => {
      const existing = tally.get(r.student.id);
      if (existing) {
        existing.absences += 1;
        return;
      }
      tally.set(r.student.id, {
        studentId: r.student.id,
        name: `${r.student.user.first_name} ${r.student.user.last_name}`,
        admissionNumber: r.student.admission_number,
        // current_class names the arm `arm_name`, not `name`.
        className: r.student.current_class
          ? armDisplayName(
              {
                name: r.student.current_class.arm_name,
                is_default: r.student.current_class.is_default,
              },
              r.student.current_class.class_name,
            )
          : "",
        absences: 1,
      });
    });
  return [...tally.values()].sort((a, b) => b.absences - a.absences).slice(0, MAX_AT_RISK);
}

