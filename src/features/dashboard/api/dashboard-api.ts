// MOCK — replace with real API calls when the backend endpoints are ready.

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

function delay(ms = 500): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getOverviewStats(): Promise<OverviewStats> {
  await delay();
  return {
    students: { label: "Total Students", value: "486", trend: { direction: "up", label: "+12 this term" }, hasData: true },
    staff: { label: "Total Staff", value: "34", trend: { direction: "flat", label: "No change" }, hasData: true },
    feeCollectionPct: {
      label: "Fee Collection",
      value: "78%",
      trend: { direction: "up", label: "+6% vs last term" },
      hasData: true,
    },
    attendanceTodayPct: {
      label: "Attendance Today",
      value: "94%",
      trend: { direction: "down", label: "-2% vs yesterday" },
      hasData: true,
    },
  };
}

export async function getTrialStatus(): Promise<TrialStatus> {
  await delay(200);
  return { isTrialing: true, daysLeft: 24 };
}
