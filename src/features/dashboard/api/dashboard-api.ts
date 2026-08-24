import { apiClient } from "@/lib/api/client";
import { ATTENDANCE_ENDPOINTS, STUDENT_ENDPOINTS, TEACHER_ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/lib/api/types";
import type { AttendanceRecord } from "@/features/attendance/types";
import { getCollectionSummary } from "@/features/fees/api/arrears-api";
import type { FeeCollectionPoint } from "@/features/fees/types";
import { toLocalIsoDate } from "@/lib/text/format-date";

export interface KpiStat {
  label: string;
  value: string;
  trend: { direction: "up" | "down" | "flat"; label: string };
  hasData: boolean;
}

export interface OverviewStats {
  students: KpiStat;
  staff: KpiStat;
  feeCollectionPct: KpiStat;
  attendanceTodayPct: KpiStat;
}

export interface TrialStatus {
  isTrialing: boolean;
  daysLeft: number;
}

async function countOf(url: string, params: Record<string, unknown> = {}): Promise<number> {
  const { data } = await apiClient.get<PaginatedResponse<unknown>>(url, {
    params: { page_size: 1, ...params },
  });
  return data.count;
}

// Real figures, or an explicit "No data yet" — never a plausible-looking
// invention. A first-time admin shown "486 students" for a school with four has
// no reason to trust anything else on the page.
//
// No trend deltas: comparing against last term needs history the API doesn't
// expose yet, and a fabricated "+12 this term" is the same lie in smaller type.
// The trend slot carries a plain descriptor instead.
// The share of one term's bill that has actually been collected.
//
// The summary carries no id or is_current flag per point, so a point can't be
// matched back to a specific AcademicPeriod — the last element is simply the
// most recent by start_date. That's the best available proxy for "the term the
// school is on", and it can legitimately be a term that has only just opened, so
// the tile names the term in its descriptor rather than leaving the figure to be
// read as school-wide or all-time.
//
// hasData is false when nothing is billed at all: 0% against a zero bill is
// arithmetic, not a fact about collection.
function feeCollectionStat(summary: FeeCollectionPoint[]): KpiStat {
  const latest = summary[summary.length - 1];
  const billed = latest ? latest.collected + latest.outstanding : 0;

  if (!latest || billed === 0) {
    return { label: "Fee Collection", value: "—", trend: { direction: "flat", label: "" }, hasData: false };
  }

  return {
    label: "Fee Collection",
    value: `${Math.round((latest.collected / billed) * 100)}%`,
    // No delta against the previous term: the two are different bills against
    // different rosters, so "+6% on last term" would compare unlike things.
    trend: { direction: "flat", label: latest.term },
    hasData: true,
  };
}

export async function getOverviewStats(): Promise<OverviewStats> {
  const today = toLocalIsoDate();

  const [students, staff, todaysAttendance, feeSummary] = await Promise.all([
    countOf(STUDENT_ENDPOINTS.LIST(), { is_active: true }),
    countOf(TEACHER_ENDPOINTS.LIST(), { is_active: true }),
    apiClient
      .get<PaginatedResponse<AttendanceRecord>>(ATTENDANCE_ENDPOINTS.LIST(), {
        params: { date: today, page_size: 100 },
      })
      .then((r) => r.data.results),
    // Returns [] rather than throwing on a 403 (view_analytics, which this
    // caller may not hold), so the whole KPI row doesn't fail over one tile.
    getCollectionSummary(),
  ]);

  // "Late" still means present for the day.
  const present = todaysAttendance.filter(
    (r) => r.status === "present" || r.status === "late",
  ).length;
  const marked = todaysAttendance.length;
  const attendancePct = marked > 0 ? Math.round((present / marked) * 100) : 0;

  return {
    students: {
      label: "Total Students",
      value: String(students),
      trend: { direction: "flat", label: students === 1 ? "enrolled" : "enrolled" },
      hasData: students > 0,
    },
    staff: {
      label: "Total Staff",
      value: String(staff),
      trend: { direction: "flat", label: "teachers" },
      hasData: staff > 0,
    },
    feeCollectionPct: feeCollectionStat(feeSummary),
    attendanceTodayPct: {
      label: "Attendance Today",
      value: `${attendancePct}%`,
      trend: {
        direction: "flat",
        label: `${present} of ${marked} marked`,
      },
      hasData: marked > 0,
    },
  };
}

// MOCK — subscription/billing isn't built, so this trial countdown is invented.
// Replace when the billing endpoints land.
function delay(ms = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getTrialStatus(): Promise<TrialStatus> {
  await delay();
  return { isTrialing: true, daysLeft: 24 };
}
