"use client";

import { useState } from "react";

import { PaginationControls } from "@/components/shared/pagination-controls";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/text/format-naira";
import { formatTimestamp } from "@/lib/text/format-timestamp";

import { useRecheckTopUp } from "../hooks/use-wallet-mutations";
import { useTopUps } from "../hooks/use-wallet-queries";
import { formatCredits } from "../lib/describe-transaction";
import type { TopUpStatus } from "../types";

const STATUS: Record<TopUpStatus, { label: string; className: string }> = {
  successful: { label: "Added", className: "border-grass/30 bg-grass/10 text-grass" },
  pending: { label: "Not confirmed", className: "border-amber/40 bg-amber/10 text-ink" },
  failed: { label: "Failed", className: "border-clay/30 bg-clay/10 text-clay" },
};

// Every checkout started, newest first. A pending one is either abandoned or
// paid but never confirmed (the admin closed the tab before Paystack sent them
// back); "Check with Paystack" runs the same verify the return page does and
// credits the wallet if it was paid.
export function TopUpsList() {
  const [page, setPage] = useState(1);
  const { data, isPending, isError } = useTopUps(page);
  const recheck = useRecheckTopUp();

  if (isPending) return <p className="text-sm text-n-400" role="status">Loading top-ups…</p>;
  if (isError) return <p className="text-sm text-clay">Couldn&rsquo;t load top-ups. Refresh to try again.</p>;
  if (data.results.length === 0) {
    return <p className="text-sm text-n-400 italic">No top-ups yet. Credits you buy will be listed here.</p>;
  }

  return (
    <div className="space-y-3">
      <ul className="divide-y divide-n-100 rounded-xl border border-n-200 bg-white">
        {data.results.map((t) => {
          const checking = recheck.isPending && recheck.variables === t.gateway_reference;
          return (
            <li key={t.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-ink">
                    {formatCredits(t.credits_purchased)} · <span className="tabular-nums">{formatNaira(t.amount)}</span>
                  </span>
                  <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS[t.status].className}`}>
                    {STATUS[t.status].label}
                  </span>
                </div>
                <p className="text-xs text-n-500 wrap-break-word">
                  {formatTimestamp(t.created_at)}
                  {t.initiated_by ? ` · ${t.initiated_by.first_name} ${t.initiated_by.last_name}` : ""}
                  {" · "}
                  <span className="font-mono break-all">{t.gateway_reference}</span>
                </p>
              </div>
              {t.status === "pending" && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 shrink-0 text-xs"
                  disabled={recheck.isPending}
                  onClick={() => recheck.mutate(t.gateway_reference)}
                >
                  {checking ? "Checking…" : "Check with Paystack"}
                </Button>
              )}
            </li>
          );
        })}
      </ul>
      <PaginationControls page={page} pageSize={25} count={data.count} onPageChange={setPage} />
    </div>
  );
}
