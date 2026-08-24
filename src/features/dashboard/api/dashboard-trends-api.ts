import { isAxiosError } from "axios";

import { apiClient } from "@/lib/api/client";
import { ATTENDANCE_ENDPOINTS, STUDENT_ENDPOINTS } from "@/lib/api/endpoints";

// The two school-wide aggregates behind the dashboard's enrolment and attendance
// cards. Both were unwired for months because the endpoints didn't exist; both
// land as bare arrays, and both return an empty series rather than throwing when
// the caller is refused.
//
// Why swallow a 403 here: all three trend cards share one query, so a single
// refusal would otherwise blank the other two — and the fee chart already
// learned that lesson. Any other failure still throws, because an empty chart
// is the right answer for "not allowed", not for "the server broke".

interface EnrollmentSummaryRow {
  month: string;
  students: number;
}

interface AttendanceSummaryRow {
  date: string;
  present: number;
  total: number;
}

async function emptyOn403<T>(request: Promise<T>, fallback: T): Promise<T> {
  try {
    return await request;
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 403) return fallback;
    throw error;
  }
}

// Cumulative headcount by month. Requires view_analytics.
//
// The response shape is already exactly what the chart wants, so this is a pass
// through rather than a transform — resist adding one.
export async function getEnrollmentTrend(): Promise<EnrollmentSummaryRow[]> {
  return emptyOn403(
    apiClient
      .get<EnrollmentSummaryRow[]>(STUDENT_ENDPOINTS.ENROLLMENT_SUMMARY())
      .then((r) => r.data),
    [],
  );
}

// Present-rate per day for the trailing week (the endpoint's own default range).
//
// Two things the raw rows can't be rendered as-is for:
//   - the chart plots a percentage, and the API returns raw present/total counts
//   - a day where nobody marked a register comes back with total 0, which would
//     divide to NaN and break the line rather than showing a gap
// Days with no register at all are dropped, not plotted as 0% — nobody being
// marked is an absence of data, and a 0% point would read as a school where
// every child was away.
export async function getAttendanceTrend(): Promise<{ day: string; rate: number }[]> {
  const rows = await emptyOn403(
    apiClient
      .get<AttendanceSummaryRow[]>(ATTENDANCE_ENDPOINTS.DAILY_SUMMARY())
      .then((r) => r.data),
    [],
  );

  return rows
    .filter((row) => row.total > 0)
    .map((row) => ({
      // "Mon 18" — the axis is a week wide, so the weekday is what orients you,
      // and a full date would crowd seven ticks into a 200px card.
      day: new Date(`${row.date}T00:00:00`).toLocaleDateString("en-US", {
        weekday: "short",
        day: "numeric",
      }),
      rate: Math.round((row.present / row.total) * 100),
    }));
}
