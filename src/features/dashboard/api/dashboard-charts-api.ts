// Placeholders for three charts that are not wired yet. Each returns an empty
// series so OverviewCharts renders its own "not available" state — the cards
// stay so the layout is right when the data lands, but they no longer invent
// figures an owner could act on.
//
// This file used to return hardcoded numbers (enrolment climbing 402 → 486, fee
// collection at 82%). They rendered identically to the real KPI tiles directly
// above them, so nothing on screen distinguished measured data from fiction.
//
// What each one needs before it can be real:
//
//   enrollment    — no endpoint aggregates enrolment over time. Every student
//                   carries date_of_admission, so the data exists; nothing
//                   groups it by month.
//   feeCollection — the fees app is still a 3-line stub. The KPI card for this
//                   already shows "—" honestly; this matches it.
//   attendance    — AttendanceRecordFilter takes class_arm_id and an *exact*
//                   date, with no range. A school-wide five-day trend would be
//                   five requests, each paginated 25-at-a-time across every
//                   student. Needs a date-range filter or a daily-summary
//                   endpoint.

export interface EnrollmentPoint {
  month: string;
  students: number;
}

export interface FeeCollectionPoint {
  term: string;
  collected: number;
  outstanding: number;
}

export interface AttendancePoint {
  day: string;
  rate: number;
}

export interface OverviewCharts {
  enrollment: EnrollmentPoint[];
  feeCollection: FeeCollectionPoint[];
  attendance: AttendancePoint[];
}

export async function getOverviewCharts(): Promise<OverviewCharts> {
  return { enrollment: [], feeCollection: [], attendance: [] };
}
