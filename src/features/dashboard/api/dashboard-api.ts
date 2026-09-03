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
// The share of the CURRENT term's bill that has actually been collected.
//
// Picks the point the school has marked current, not the newest by start_date.
// Those differ the moment a school sets up next term's dates in advance — which
// is ordinary practice — and the old `summary[length - 1]` then reported a term
// nobody has started yet: a bill of ₦0 collected against ₦0 billed, which fell
// through to "—" and made a school with healthy collection look like it had no
// fee data at all. The backend added `is_current` per point for exactly this.
//
// Falls back to the last element when no period is marked current. A school can
// genuinely be between terms, and the newest is the best guess available; the
// descriptor names the term either way, so the figure is never left to be read
// as school-wide or all-time.
//
// hasData is false when nothing is billed at all: 0% against a zero bill is
// arithmetic, not a fact about collection.
function feeCollectionStat(summary: FeeCollectionPoint[]): KpiStat {
  const current = summary.find((point) => point.is_current) ?? summary[summary.length - 1];
  const billed = current ? current.collected + current.outstanding : 0;

  if (!current || billed === 0) {
    return { label: "Fee Collection", value: "—", trend: { direction: "flat", label: "" }, hasData: false };
  }

  return {
    label: "Fee Collection",
    value: `${Math.round((current.collected / billed) * 100)}%`,
    // No delta against the previous term: the two are different bills against
    // different rosters, so "+6% on last term" would compare unlike things.
    trend: { direction: "flat", label: current.term },
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

