"use client";

import { useState } from "react";

import { DateRangeFields, dateRangeParams } from "@/components/shared/date-range-fields";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { formatNaira } from "@/lib/text/format-naira";
import { formatTimestamp } from "@/lib/text/format-timestamp";

import { useRecheckTopUp } from "../hooks/use-wallet-mutations";
import { useTopUps } from "../hooks/use-wallet-queries";
import { formatCredits } from "../lib/describe-transaction";
import type { TopUpStatus } from "../types";

// "failed" is not a declined card: Paystack's verify reports an unpaid or
// abandoned checkout as false, which the server records as failed (checked
// live 2026-11-09). So it reads "Not paid", and stays re-checkable.
const STATUS: Record<TopUpStatus, { label: string; className: string }> = {
  successful: { label: "Added", className: "border-grass/30 bg-grass/10 text-grass" },
  pending: { label: "Not confirmed", className: "border-amber/40 bg-amber/10 text-ink" },
  failed: { label: "Not paid", className: "border-n-200 bg-n-50 text-n-600" },
};

// Every checkout started, newest first. "Check with Paystack" runs the same
// verify the return page does and credits the wallet if it was paid: for a
// tab closed before Paystack sent the admin back, or a payment finished after
// an earlier check (the server re-verifies a failed row; only success is final).
export function TopUpsList() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<TopUpStatus | "">("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const { data, isPending, isError } = useTopUps({ page, ...(status && { status }), ...dateRangeParams(from, to) });
  const recheck = useRecheckTopUp();
  const filtered = !!status || !!from || !!to;

  const filters = (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <Select aria-label="Top-up status" value={status} onChange={(e) => { setStatus(e.target.value as TopUpStatus | ""); setPage(1); }} className="h-9 w-full sm:w-44">
        <option value="">Any status</option>
        <option value="successful">{STATUS.successful.label}</option>
        <option value="pending">{STATUS.pending.label}</option>
        <option value="failed">{STATUS.failed.label}</option>
      </Select>
      <DateRangeFields idPrefix="topups" from={from} to={to} onFromChange={(v) => { setFrom(v); setPage(1); }} onToChange={(v) => { setTo(v); setPage(1); }} />
    </div>
  );

  if (isPending || isError || data.results.length === 0) {
    return (
      <div className="space-y-3">
        {filters}
        {isPending ? (
          <p className="text-sm text-n-400" role="status">Loading top-ups…</p>
        ) : isError ? (
          <p className="text-sm text-clay">Couldn&rsquo;t load top-ups. Refresh to try again.</p>
        ) : (
          <p className="text-sm text-n-400 italic">
            {filtered ? "No top-ups match these filters." : "No top-ups yet. Credits you buy will be listed here."}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filters}
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
                  <span className="font-mono whitespace-nowrap">{t.gateway_reference}</span>
                </p>
              </div>
              {t.status !== "successful" && (
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
