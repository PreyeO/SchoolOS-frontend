"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useOverviewCharts } from "../hooks/use-overview-charts";
import { EnrollmentChart } from "./charts/enrollment-chart";
import { FeeCollectionChart } from "./charts/fee-collection-chart";
import { AttendanceChart } from "./charts/attendance-chart";

function ChartCard({
  title,
  isPending,
  isEmpty,
  children,
}: {
  title: string;
  isPending: boolean;
  isEmpty: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-n-200 bg-white p-4">
      <p className="mb-2 text-sm font-semibold text-ink">{title}</p>
      {isPending ? (
        <Skeleton className="h-[200px] w-full" />
      ) : isEmpty ? (
        <div className="flex h-[200px] items-center justify-center text-sm text-n-400">
          No data yet
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
      <ChartCard title="Enrollment trend" isPending={isPending} isEmpty={!data?.enrollment.length}>
        {data && <EnrollmentChart data={data.enrollment} />}
      </ChartCard>
      <ChartCard title="Fee collection vs outstanding" isPending={isPending} isEmpty={!data?.feeCollection.length}>
        {data && <FeeCollectionChart data={data.feeCollection} />}
      </ChartCard>
      <ChartCard title="Attendance trend" isPending={isPending} isEmpty={!data?.attendance.length}>
        {data && <AttendanceChart data={data.attendance} />}
      </ChartCard>
    </div>
  );
}
