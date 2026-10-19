"use client";

import Link from "next/link";

import { ErrorState } from "@/components/shared/error-state";
import { formatNaira } from "@/lib/text/format-naira";

import { usePlatformFinancials } from "../hooks/use-platform";
import { AccessBadge } from "./access-badge";
import { ScratchCardRevenue } from "./scratch-card-revenue";

// Projected revenue, per school.
//
// "Projected" is doing real work in that word: subscriptions don't go through
// a payment gateway, so none of the subscription figures has been invoiced or
// collected. Scratch cards do (Paystack), which is why their real money sits
// in a separate section rather than being added to the projection. For an unsubscribed school the
// price is a default standing in for one they haven't agreed to — which is why
// price_is_locked is surfaced per row rather than hidden. Without it the total
// reads as money owed instead of money possible.
export function PlatformRevenuePage() {
  const { data, isPending, isError, error } = usePlatformFinancials();

  if (isPending) {
    return <p className="text-sm text-n-400" role="status">Loading…</p>;
  }
  if (isError || !data) {
    return <ErrorState error={error} resourceLabel="revenue" />;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Revenue</h1>
        <p className="mt-1 text-sm text-n-500">
          Projected subscription revenue by school, which hasn&rsquo;t been invoiced. Result PIN money, which
          has been collected, is listed separately below.
        </p>
      </div>

      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Total label="Schools" value={String(data.school_count)} />
        <Total label="Subscribed" value={String(data.subscribed_school_count)} />
        <Total
          label="Projected termly"
          value={formatNaira(data.estimated_termly_revenue_total)}
        />
      </dl>

      <div className="overflow-x-auto rounded-xl border border-n-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-n-200 text-xs uppercase tracking-wide text-n-400">
              <th className="px-3 py-2.5 font-medium">School</th>
              <th className="px-3 py-2.5 font-medium">Access</th>
              <th className="px-3 py-2.5 text-right font-medium">Students</th>
              <th className="px-3 py-2.5 text-right font-medium">Billed for</th>
              <th className="px-3 py-2.5 text-right font-medium">Per student</th>
              <th className="px-3 py-2.5 text-right font-medium">Termly</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-n-100">
            {data.schools.map((row) => (
              <tr key={row.school.id}>
                <td className="px-3 py-2.5">
                  <Link
                    href={`/platform/schools/${row.school.id}`}
                    className="font-medium text-ink hover:underline"
                  >
                    {row.school.name}
                  </Link>
                </td>
                <td className="px-3 py-2.5">
                  <AccessBadge status={row.access_status} />
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums text-n-500">
                  {row.student_count}
                </td>
                {/* billable_students is max(capacity, billing floor), not the
                    headcount — the gap between the two columns is the whole
                    reason both are shown. */}
                <td className="px-3 py-2.5 text-right tabular-nums text-ink">
                  {row.billable_students}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums text-n-500">
                  {formatNaira(row.price_per_student)}
                  {!row.price_is_locked && (
                    <span className="ml-1 text-[10px] text-n-400">est.</span>
                  )}
                </td>
                <td className="px-3 py-2.5 text-right font-medium tabular-nums text-ink">
                  {formatNaira(row.estimated_termly_revenue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-n-400">
        <span className="font-medium">est.</span> marks a school with no agreed price — the
        platform default is used as a projection. Schools are billed on declared capacity,
        not current headcount.
      </p>

      <ScratchCardRevenue rows={data.schools} total={data.scratch_card_revenue_total ?? 0} />
    </div>
  );
}

function Total({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-n-200 bg-white p-4">
      <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-n-400">{label}</dt>
      <dd className="mt-1.5 font-display text-2xl font-bold tabular-nums text-ink">{value}</dd>
    </div>
  );
}
