"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, MessageSquare, Printer } from "lucide-react";

import { PaginationControls } from "@/components/shared/pagination-controls";
import { Select } from "@/components/ui/select";
import { formatTimestamp } from "@/lib/text/format-timestamp";

import { useIssuanceBatches } from "../../hooks/use-issuance";
import { batchScopeName } from "../../lib/assignment-labels";
import { batchHref } from "../../lib/batch-back-link";
import type { IssuanceChannel } from "../../types";
import { useSessionFilter } from "../session-filter";

// Every issuance, newest first: counts only. Delivery per recipient lives on
// the detail page, which is the one that polls.
export function BatchesList() {
  const [page, setPage] = useState(1);
  const [channel, setChannel] = useState<IssuanceChannel | "">("");
  const session = useSessionFilter("batches");
  const { data, isPending, isError } = useIssuanceBatches({
    page,
    ...(channel && { channel }),
    ...(session.sessionId && { academic_session: session.sessionId }),
  });

  const filters = (
    <div className="flex flex-col gap-2 sm:flex-row">
      {session.control(() => setPage(1))}
      <Select aria-label="Texted or printed" value={channel} onChange={(e) => { setChannel(e.target.value as IssuanceChannel | ""); setPage(1); }} className="h-9 w-full sm:w-44">
        <option value="">Texted and printed</option>
        <option value="sms">Texted</option>
        <option value="print">Printed</option>
      </Select>
    </div>
  );

  if (isPending || isError || data.results.length === 0) {
    return (
      <div className="space-y-3">
        {filters}
        {isPending ? (
          <p className="text-sm text-n-400" role="status">Loading sends…</p>
        ) : isError ? (
          <p className="text-sm text-clay">Couldn&rsquo;t load sends. Refresh to try again.</p>
        ) : (
          <p className="text-sm text-n-400 italic">
            {channel || !session.isAll ? "No sends match these filters." : "Nothing issued yet. Cards you text or print for students appear here."}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filters}
      <ul className="divide-y divide-n-100 rounded-xl border border-n-200 bg-white">
        {data.results.map((b) => {
          const Icon = b.channel === "sms" ? MessageSquare : Printer;
          return (
            <li key={b.id}>
              <Link href={batchHref(b.id, { from: "records" })} className="flex items-center gap-3 px-4 py-3 hover:bg-n-50">
                <Icon className="size-4 shrink-0 text-n-400" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">
                    {b.channel === "sms" ? "Texted" : "Printed"} {b.student_count} card{b.student_count === 1 ? "" : "s"}
                    {/* The list carries no scope_detail, so no class name here; the detail page names it. */}
                    <span className="font-normal text-n-500"> · {batchScopeName(b, [])}</span>
                  </p>
                  <p className="text-xs text-n-500">{b.session_name} · {formatTimestamp(b.created_at)}</p>
                </div>
                <ChevronRight className="size-4 shrink-0 text-n-300" aria-hidden />
              </Link>
            </li>
          );
        })}
      </ul>
      <PaginationControls page={page} pageSize={25} count={data.count} onPageChange={setPage} />
    </div>
  );
}
