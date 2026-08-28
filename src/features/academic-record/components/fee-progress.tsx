"use client";

import type { StudentLedger } from "@/features/fees/types";
import { formatNaira } from "@/lib/text/format-naira";

// How much of the term's bill is settled.
//
// A stacked bar rather than a chart: there are at most three parts and they sum
// to one known total, which a bar shows exactly and a donut only approximates.
//
// Waived is kept separate from paid rather than folded in. Both leave nothing
// owing, but "the school wrote this off" and "you paid this" are different
// facts, and a parent checking what they were charged should see which is which.
export function FeeProgress({ ledger }: { ledger: StudentLedger }) {
  const billed = ledger.items.reduce((sum, item) => sum + item.amount, 0);
  const waived = ledger.items
    .filter((item) => item.is_waived)
    .reduce((sum, item) => sum + item.amount, 0);
  const paid = ledger.items.reduce((sum, item) => sum + item.paid, 0);
  const outstanding = ledger.total_balance;

  if (!ledger.is_billed || billed === 0) return null;

  const pct = (value: number) => `${(value / billed) * 100}%`;
  const segments = [
    { key: "paid", label: "Paid", value: paid, className: "bg-grass" },
    { key: "waived", label: "Waived", value: waived, className: "bg-primary/40" },
    { key: "outstanding", label: "Outstanding", value: outstanding, className: "bg-amber" },
  ].filter((segment) => segment.value > 0);

  return (
    <div className="rounded-xl border border-n-200 bg-white p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-n-400">
          This term&rsquo;s fees
        </p>
        <p className="text-xs text-n-500">
          <span className="font-medium text-ink">{formatNaira(paid + waived)}</span> of{" "}
          {formatNaira(billed)}
        </p>
      </div>

      <div
        className="mt-2.5 flex h-2.5 overflow-hidden rounded-full bg-n-100"
        role="img"
        aria-label={`${formatNaira(paid)} paid, ${formatNaira(waived)} waived, ${formatNaira(outstanding)} outstanding of ${formatNaira(billed)} billed`}
      >
        {segments.map((segment) => (
          <div
            key={segment.key}
            className={segment.className}
            style={{ width: pct(segment.value) }}
          />
        ))}
      </div>

      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
        {segments.map((segment) => (
          <li key={segment.key} className="flex items-center gap-1.5 text-xs">
            <span className={`size-2 shrink-0 rounded-full ${segment.className}`} />
            <span className="text-n-500">{segment.label}</span>
            <span className="font-medium tabular-nums text-ink">{formatNaira(segment.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
