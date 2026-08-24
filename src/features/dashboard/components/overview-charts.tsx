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
  // It used to say "No data yet" for all three, which blames the school — an
  // owner reads that as "nobody has marked a register" and goes looking for
  // work they've already done. None of these are empty because of anything the
  // school did or didn't do; they're empty because the figures aren't wired
  // yet. See dashboard-charts-api for what each one needs.
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
        <Skeleton className="h-[200px] w-full" />
      ) : isEmpty ? (
        <div className="flex h-[200px] items-center justify-center px-4 text-center text-sm text-n-400">
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
    <div className="grid lg:grid-cols-3 gap-4">
      <ChartCard
        title="Enrollment trend"
        isPending={isPending}
        isEmpty={!data?.enrollment.length}
        emptyMessage="Enrolment isn't tracked over time yet."
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
        emptyMessage="Daily figures aren't totalled school-wide yet — today's rate is in the cards above."
      >
        {data && <AttendanceChart data={data.attendance} />}
      </ChartCard>
    </div>
  );
}
