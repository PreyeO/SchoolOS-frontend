"use client";

import { useState } from "react";

import { DateRangeFields, dateRangeParams } from "@/components/shared/date-range-fields";
import { PaginationControls } from "@/components/shared/pagination-controls";
import { Select } from "@/components/ui/select";
import { formatNaira } from "@/lib/text/format-naira";
import { formatTimestamp } from "@/lib/text/format-timestamp";

import { useCardPurchases } from "../hooks/use-scratch-card-queries";
import type { CardPurchase, PurchaseStatus } from "../types";
import { useSessionFilter } from "./session-filter";

const STATUS: Record<PurchaseStatus, { label: string; className: string }> = {
  successful: { label: "Paid", className: "border-grass/30 bg-grass/10 text-grass" },
  pending: { label: "Not completed", className: "border-amber/40 bg-amber/10 text-ink" },
  failed: { label: "Failed", className: "border-clay/30 bg-clay/10 text-clay" },
};

// "40 cards", or "40 cards · 43 made" once replacements (which create new
// cards under the same purchase) push card_count past quantity. Expected,
// per the handoff, not a bug.
function CardsBought({ p }: { p: CardPurchase }) {
  return (
    <>
      {p.quantity} card{p.quantity === 1 ? "" : "s"}
      {p.card_count > p.quantity && (
        <span className="text-n-500" title="Includes replacement cards issued under this purchase.">
          {" "}· {p.card_count} incl. replacements
        </span>
      )}
    </>
  );
}

// Every checkout this school has started, newest first, filtered on the
// server. "Not completed" covers an abandoned checkout and one Paystack hasn't
// confirmed; no cards exist for either.
export function PurchasesTable() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<PurchaseStatus | "">("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const session = useSessionFilter("purchases");
  const reset = () => setPage(1);
  const { data, isPending, isError } = useCardPurchases({
    page,
    ...(status && { status }),
    ...(session.sessionId && { academic_session_id: session.sessionId }),
    ...dateRangeParams(from, to),
  });
  const filtered = !!status || !!from || !!to;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        {session.control(reset)}
        <Select aria-label="Payment status" value={status} onChange={(e) => { setStatus(e.target.value as PurchaseStatus | ""); reset(); }} className="h-9 w-full sm:w-44">
          <option value="">Any status</option>
          <option value="successful">Paid</option>
          <option value="pending">Not completed</option>
          <option value="failed">Failed</option>
        </Select>
        <DateRangeFields idPrefix="purchases" from={from} to={to} onFromChange={(v) => { setFrom(v); reset(); }} onToChange={(v) => { setTo(v); reset(); }} />
      </div>

      {isPending ? (
        <p className="text-sm text-n-400" role="status">Loading purchases…</p>
      ) : isError ? (
        <p className="text-sm text-clay">Couldn&rsquo;t load purchases. Refresh to try again.</p>
      ) : data.results.length === 0 ? (
        <p className="text-sm text-n-400 italic">
          {filtered || !session.isAll ? "No purchases match these filters." : "No purchases yet. Cards you buy will be listed here."}
        </p>
      ) : (
        <>
          <ul className="divide-y divide-n-100 rounded-xl border border-n-200 bg-white">
            {data.results.map((p) => (
              <li key={p.id} className="space-y-1 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                  <span className="text-sm font-medium text-ink">
                    <CardsBought p={p} /> · <span className="tabular-nums">{formatNaira(p.amount)}</span>
                  </span>
                  <span className={`shrink-0 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium ${STATUS[p.status].className}`}>
                    {STATUS[p.status].label}
                  </span>
                </div>
                <p className="text-xs text-n-500 wrap-break-word">
                  {p.academic_session_name} · {formatTimestamp(p.created_at)}
                  {p.initiated_by ? ` · ${p.initiated_by.first_name} ${p.initiated_by.last_name}` : ""}
                  {p.pins_revealed_at ? " · PINs printed" : ""}
                </p>
              </li>
            ))}
          </ul>
          <PaginationControls page={page} pageSize={25} count={data.count} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
