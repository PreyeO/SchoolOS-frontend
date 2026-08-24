import { getCollectionSummary } from "@/features/fees/api/arrears-api";
import type { FeeCollectionPoint } from "@/features/fees/types";

import { getAttendanceTrend, getEnrollmentTrend } from "./dashboard-trends-api";

// All three dashboard trend cards, fetched together.
//
// Every one of them used to be a hardcoded invention here (enrolment climbing
// 402 → 486, fee collection at 82%), rendering identically to the real KPI tiles
// directly above and so indistinguishable from measured data. They were then
// emptied out and left with an honest "not available yet" state until the
// backend could answer for real. All three now can.
//
// Each source swallows its own 403 and returns an empty series, because they
// share this one query and are gated differently: fees and enrolment need
// view_analytics, attendance needs view_attendance-or-teacher. Without that, an
// admin missing one permission would lose all three cards.

export interface EnrollmentPoint {
  month: string;
  students: number;
}

export type { FeeCollectionPoint };

export interface AttendancePoint {
  day: string;
  rate: number;
}

export interface OverviewCharts {
  enrollment: EnrollmentPoint[];
  feeCollection: FeeCollectionPoint[];
  attendance: AttendancePoint[];
}

// A point with nothing billed and nothing collected is not a data point — it's a
// term the school hadn't set fees for. Six empty bars read as "collection is
// zero", which is a different and alarming claim, so the card falls back to its
// empty state unless at least one term has real money in it.
export function hasFeeData(points: FeeCollectionPoint[]): boolean {
  return points.some((p) => p.collected > 0 || p.outstanding > 0);
}

export async function getOverviewCharts(): Promise<OverviewCharts> {
  const [enrollment, feeCollection, attendance] = await Promise.all([
    getEnrollmentTrend(),
    getCollectionSummary(),
    getAttendanceTrend(),
  ]);
  return { enrollment, feeCollection, attendance };
}
