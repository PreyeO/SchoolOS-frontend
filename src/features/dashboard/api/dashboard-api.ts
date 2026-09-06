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
  // False when the caller's role doesn't carry the school permission this
  // figure needs at all (view_students / view_staff / view_attendance /
  // view_analytics — accounts/permissions.py) — a different case from
  // hasData: false, which means "you can see this, there's just nothing here
  // yet". A roleless admin (is_admin persona, no SchoolAdminRole permissions)
  // reaches the same dashboard as any other admin, so this is the ordinary
  // case, not an edge one. KpiCards hides a tile with permitted: false rather
  // than show an empty or perpetually-loading one for data nobody granted the
  // right to see.
  permitted: boolean;
}

export interface OverviewStats {
  students: KpiStat;
  staff: KpiStat;
  feeCollectionPct: KpiStat;
  attendanceTodayPct: KpiStat;
}

export interface OverviewStatsPermissions {
  viewStudents: boolean;
  viewStaff: boolean;
  viewAttendance: boolean;
  viewAnalytics: boolean;
}

const NOT_PERMITTED = {
  value: "",
  trend: { direction: "flat" as const, label: "" },
  hasData: false,
  permitted: false,
};

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
    return { label: "Fee Collection", value: "—", trend: { direction: "flat", label: "" }, hasData: false, permitted: true };
  }

  return {
    label: "Fee Collection",
    value: `${Math.round((current.collected / billed) * 100)}%`,
    // No delta against the previous term: the two are different bills against
    // different rosters, so "+6% on last term" would compare unlike things.
    trend: { direction: "flat", label: current.term },
    hasData: true,
    permitted: true,
  };
}

// Which figures to even ask for, checked BEFORE fetching rather than caught
// after a refusal — the same way every other screen in this app decides what
// an admin can do (useHasSchoolPermission), so a tile nobody granted the
// right to see is never fetched at all rather than fetched and then hidden.
// Was a bare Promise.all with no permission awareness: Students and Staff
// (StudentProfileViewSet/TeacherProfileViewSet, both HasSchoolPermission) 403
// outright for an admin missing view_students/view_staff, which rejected the
// WHOLE Promise.all — and KpiCards' render check (isPending || !data) never
// looked at isError, so a rejected query and a still-loading one rendered
// identically: skeletons, forever. Attendance doesn't 403 the same way
// (AttendanceRecordViewSet has no permission-string gate, just a queryset
// that returns nothing an admin without view_attendance can't see) but is
// checked here too for the same reason Fee Collection already was — showing
// "0% attendance today" to someone who genuinely can't see any attendance
// record is a different flavour of the identical problem.
export async function getOverviewStats(permissions: OverviewStatsPermissions): Promise<OverviewStats> {
  const today = toLocalIsoDate();

  const [students, staff, todaysAttendance, feeSummary] = await Promise.all([
    permissions.viewStudents ? countOf(STUDENT_ENDPOINTS.LIST(), { is_active: true }) : null,
    permissions.viewStaff ? countOf(TEACHER_ENDPOINTS.LIST(), { is_active: true }) : null,
    permissions.viewAttendance
      ? apiClient
          .get<PaginatedResponse<AttendanceRecord>>(ATTENDANCE_ENDPOINTS.LIST(), {
            params: { date: today, page_size: 100 },
          })
          .then((r) => r.data.results)
      : null,
    // Also still returns [] rather than throwing on a 403, defensively — a
    // role can change between /me landing and this request going out.
    permissions.viewAnalytics ? getCollectionSummary() : null,
  ]);

  // "Late" still means present for the day.
  const present = todaysAttendance?.filter((r) => r.status === "present" || r.status === "late").length ?? 0;
  const marked = todaysAttendance?.length ?? 0;
  const attendancePct = marked > 0 ? Math.round((present / marked) * 100) : 0;

  return {
    students:
      students === null
        ? { label: "Total Students", ...NOT_PERMITTED }
        : {
            label: "Total Students",
            value: String(students),
            trend: { direction: "flat", label: "enrolled" },
            hasData: students > 0,
            permitted: true,
          },
    staff:
      staff === null
        ? { label: "Total Staff", ...NOT_PERMITTED }
        : {
            label: "Total Staff",
            value: String(staff),
            trend: { direction: "flat", label: "teachers" },
            hasData: staff > 0,
            permitted: true,
          },
    feeCollectionPct: feeSummary === null ? { label: "Fee Collection", ...NOT_PERMITTED } : feeCollectionStat(feeSummary),
    attendanceTodayPct:
      todaysAttendance === null
        ? { label: "Attendance Today", ...NOT_PERMITTED }
        : {
            label: "Attendance Today",
            value: `${attendancePct}%`,
            trend: {
              direction: "flat",
              label: `${present} of ${marked} marked`,
            },
            hasData: marked > 0,
            permitted: true,
          },
  };
}

