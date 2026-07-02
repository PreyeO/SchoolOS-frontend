// MOCK — replace with real API calls when the backend endpoints are ready.

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

function delay(ms = 600): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getOverviewCharts(): Promise<OverviewCharts> {
  await delay();
  return {
    enrollment: [
      { month: "Feb", students: 402 },
      { month: "Mar", students: 418 },
      { month: "Apr", students: 431 },
      { month: "May", students: 447 },
      { month: "Jun", students: 463 },
      { month: "Jul", students: 486 },
    ],
    feeCollection: [
      { term: "First Term", collected: 82, outstanding: 18 },
      { term: "Second Term", collected: 74, outstanding: 26 },
      { term: "Third Term", collected: 78, outstanding: 22 },
    ],
    attendance: [
      { day: "Mon", rate: 96 },
      { day: "Tue", rate: 95 },
      { day: "Wed", rate: 93 },
      { day: "Thu", rate: 97 },
      { day: "Fri", rate: 94 },
    ],
  };
}
