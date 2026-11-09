"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, MessageSquare, Printer } from "lucide-react";

import { PaginationControls } from "@/components/shared/pagination-controls";
import { formatTimestamp } from "@/lib/text/format-timestamp";

import { useIssuanceBatches } from "../../hooks/use-issuance";
import { batchScopeLabel } from "../../lib/message-status";

// Every issuance, newest first: counts only. Delivery per recipient lives on
// the detail page, which is the one that polls.
export function BatchesList() {
  const [page, setPage] = useState(1);
  const { data, isPending, isError } = useIssuanceBatches(page);

  if (isPending) return <p className="text-sm text-n-400" role="status">Loading sends…</p>;
  if (isError) return <p className="text-sm text-clay">Couldn&rsquo;t load sends. Refresh to try again.</p>;
  if (data.results.length === 0) {
    return <p className="text-sm text-n-400 italic">Nothing issued yet. Cards you text or print for students appear here.</p>;
  }

  return (
    <div className="space-y-3">
      <ul className="divide-y divide-n-100 rounded-xl border border-n-200 bg-white">
        {data.results.map((b) => {
          const Icon = b.channel === "sms" ? MessageSquare : Printer;
          return (
            <li key={b.id}>
              <Link href={`/scratch-cards/batches/${b.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-n-50">
                <Icon className="size-4 shrink-0 text-n-400" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">
                    {b.channel === "sms" ? "Texted" : "Printed"} {b.student_count} card{b.student_count === 1 ? "" : "s"}
                    <span className="font-normal text-n-500"> · {batchScopeLabel(b)}</span>
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
