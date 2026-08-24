"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { hasFeeData } from "../api/dashboard-charts-api";
import { useOverviewCharts } from "../hooks/use-overview-charts";
import { EnrollmentChart } from "./charts/enrollment-chart";
import { FeeCollectionChart } from "./charts/fee-collection-chart";
import { AttendanceChart } from "./charts/attendance-chart";

function ChartCard({
  title,
  isPending,
  isEmpty,
  // Why this chart is empty, in the school's terms.
  //
  // All three are wired to real endpoints now, so an empty card genuinely does
  // mean "no data yet" — but it still has to say WHICH data, and never imply
  // the school failed to do something. "No registers marked in the last week"
  // is actionable; "no data" sends an owner hunting for work they've done.
  emptyMessage,
  children,
}: {
  title: string;
  isPending: boolean;
  isEmpty: boolean;
  emptyMessage: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-n-200 bg-white p-4">
      <p className="mb-2 text-sm font-semibold text-ink">{title}</p>
      {isPending ? (
        <Skeleton className="h-50 w-full" />
      ) : isEmpty ? (
        <div className="flex h-50 items-center justify-center px-4 text-center text-sm text-n-400">
          {emptyMessage}
        </div>
      ) : (
        children
      )}
    </div>
  );
}

export function OverviewCharts() {
  const { data, isPending } = useOverviewCharts();

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <ChartCard
        title="Enrollment trend"
        isPending={isPending}
        isEmpty={!data?.enrollment.length}
        emptyMessage="Nothing to chart yet — this fills in as students are admitted."
      >
        {data && <EnrollmentChart data={data.enrollment} />}
      </ChartCard>
      <ChartCard
        title="Fee collection vs outstanding"
        isPending={isPending}
        isEmpty={!data || !hasFeeData(data.feeCollection)}
        emptyMessage="Available once fees are set up and payments start coming in."
      >
        {data && <FeeCollectionChart data={data.feeCollection} />}
      </ChartCard>
      <ChartCard
        title="Attendance trend"
        isPending={isPending}
        isEmpty={!data?.attendance.length}
        emptyMessage="No registers marked in the last week — today's rate is in the cards above."
      >
        {data && <AttendanceChart data={data.attendance} />}
      </ChartCard>
    </div>
  );
}
