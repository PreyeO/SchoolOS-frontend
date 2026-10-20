"use client";

import { useState } from "react";

import { PaginationControls } from "@/components/shared/pagination-controls";
import { formatNaira } from "@/lib/text/format-naira";
import { formatTimestamp } from "@/lib/text/format-timestamp";

import { useCardPurchases } from "../hooks/use-scratch-card-queries";
import type { PurchaseStatus } from "../types";

const STATUS: Record<PurchaseStatus, { label: string; className: string }> = {
  successful: { label: "Paid", className: "border-grass/30 bg-grass/10 text-grass" },
  pending: { label: "Not completed", className: "border-amber/40 bg-amber/10 text-ink" },
  failed: { label: "Failed", className: "border-clay/30 bg-clay/10 text-clay" },
};

// Every checkout this school has started, newest first. "Not completed" covers
// both an abandoned checkout and one Paystack hasn't confirmed yet; no cards
// exist for either.
export function PurchasesTable() {
  const [page, setPage] = useState(1);
  const { data, isPending, isError } = useCardPurchases(page);

  if (isPending) return <p className="text-sm text-n-400" role="status">Loading purchases…</p>;
  if (isError) return <p className="text-sm text-clay">Couldn&rsquo;t load purchases. Refresh to try again.</p>;
  if (data.results.length === 0) {
    return <p className="text-sm text-n-400 italic">No purchases yet. Cards you buy will be listed here.</p>;
  }

  return (
    <div className="space-y-3">
      {/* Phones: the six-column table needs ~640px, so a compact list instead. */}
      <ul className="divide-y divide-n-100 rounded-xl border border-n-200 bg-white sm:hidden">
        {data.results.map((p) => (
          <li key={p.id} className="space-y-1 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-ink">
                {p.quantity} card{p.quantity === 1 ? "" : "s"} · <span className="tabular-nums">{formatNaira(p.amount)}</span>
              </span>
              <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS[p.status].className}`}>
                {STATUS[p.status].label}
              </span>
            </div>
            <p className="text-xs text-n-500 wrap-break-word">
              {p.academic_session_name} · {formatTimestamp(p.created_at)}
              {p.initiated_by ? ` · ${p.initiated_by.first_name} ${p.initiated_by.last_name}` : ""}
            </p>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto rounded-xl border border-n-200 bg-white sm:block">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-n-200 text-xs uppercase tracking-wide text-n-400">
              <th className="px-3 py-2.5 font-medium">Date</th>
              <th className="px-3 py-2.5 font-medium">Session</th>
              <th className="px-3 py-2.5 text-right font-medium">Cards</th>
              <th className="px-3 py-2.5 text-right font-medium">Amount</th>
              <th className="px-3 py-2.5 font-medium">Status</th>
              <th className="px-3 py-2.5 font-medium">Bought by</th>
            </tr>
          </thead>
          <tbody>
            {data.results.map((p) => (
              <tr key={p.id} className="border-b border-n-100 last:border-0 text-sm">
                <td className="whitespace-nowrap px-3 py-2.5 text-n-500">{formatTimestamp(p.created_at)}</td>
                <td className="px-3 py-2.5 text-ink">{p.academic_session_name}</td>
                <td className="px-3 py-2.5 text-right font-mono tabular-nums">{p.quantity}</td>
                <td className="px-3 py-2.5 text-right font-mono tabular-nums">{formatNaira(p.amount)}</td>
                <td className="px-3 py-2.5">
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS[p.status].className}`}>
                    {STATUS[p.status].label}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-n-500">
                  {p.initiated_by ? `${p.initiated_by.first_name} ${p.initiated_by.last_name}` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PaginationControls page={page} pageSize={25} count={data.count} onPageChange={setPage} />
    </div>
  );
}
