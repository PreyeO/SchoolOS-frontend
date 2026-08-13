import { apiClient } from "@/lib/api/client";
import { ATTENDANCE_ENDPOINTS, STUDENT_ENDPOINTS, TEACHER_ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/lib/api/types";
import type { AttendanceRecord } from "@/features/attendance/types";
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
export async function getOverviewStats(): Promise<OverviewStats> {
  const today = toLocalIsoDate();

  const [students, staff, todaysAttendance] = await Promise.all([
    countOf(STUDENT_ENDPOINTS.LIST(), { is_active: true }),
    countOf(TEACHER_ENDPOINTS.LIST(), { is_active: true }),
    apiClient
      .get<PaginatedResponse<AttendanceRecord>>(ATTENDANCE_ENDPOINTS.LIST(), {
        params: { date: today, page_size: 100 },
      })
      .then((r) => r.data.results),
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
    // The fees module doesn't exist yet, so there is genuinely nothing to show.
    feeCollectionPct: {
      label: "Fee Collection",
      value: "—",
      trend: { direction: "flat", label: "" },
      hasData: false,
    },
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
