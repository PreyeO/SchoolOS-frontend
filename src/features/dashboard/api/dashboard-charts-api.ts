import { getCollectionSummary } from "@/features/fees/api/arrears-api";
import type { FeeCollectionPoint } from "@/features/fees/types";

// Fee collection is real now (see getCollectionSummary). The other two are still
// placeholders returning an empty series, so OverviewCharts renders its own "not
// available" state — the cards stay so the layout is right when the data lands,
// but they no longer invent figures an owner could act on.
//
// This file used to return hardcoded numbers (enrolment climbing 402 → 486, fee
// collection at 82%). They rendered identically to the real KPI tiles directly
// above them, so nothing on screen distinguished measured data from fiction.
//
// What the remaining two need before they can be real:
//
//   enrollment    — no endpoint aggregates enrolment over time. Every student
//                   carries date_of_admission, so the data exists; nothing
//                   groups it by month.
//   attendance    — AttendanceRecordFilter takes class_arm_id and an *exact*
//                   date, with no range. A school-wide five-day trend would be
//                   five requests, each paginated 25-at-a-time across every
//                   student. Needs a date-range filter or a daily-summary
//                   endpoint.

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
  const feeCollection = await getCollectionSummary();
  return { enrollment: [], feeCollection, attendance: [] };
}
