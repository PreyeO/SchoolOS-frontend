"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { ErrorState } from "@/components/shared/error-state";
import { formatTimestamp } from "@/lib/text/format-timestamp";

import { batchInFlight, useIssuanceBatch } from "../../hooks/use-issuance";
import { batchScopeLabel, MESSAGE_STATUS_META, statusCounts } from "../../lib/message-status";

// /scratch-cards/batches/[id]: who a send went to, and how each text is doing.
// Refreshes itself every few seconds while any text is queued or sending.
export function BatchDetailPage({ id }: { id: string }) {
  const { data: batch, isPending, isError, error } = useIssuanceBatch(id);
  const back = <Link href="/scratch-cards" className="text-sm text-primary hover:underline">← Result Cards</Link>;

  if (isPending) return <div className="space-y-4">{back}<p className="text-sm text-n-400" role="status">Loading…</p></div>;
  if (isError) return <div className="space-y-4">{back}<ErrorState error={error} resourceLabel="this send" /></div>;

  const live = batchInFlight(batch);
  const texted = batch.channel === "sms";

  return (
    <div className="space-y-5">
      {back}
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">
          {texted ? "Texted" : "Printed"} {batch.student_count} card{batch.student_count === 1 ? "" : "s"}
        </h1>
        <p className="mt-1 text-sm text-n-500">
          {batchScopeLabel(batch)} · {batch.session_name} · {formatTimestamp(batch.created_at)}
        </p>
      </div>

      {texted && (
        <div className="flex flex-wrap items-center gap-2" aria-live="polite">
          {statusCounts(batch).map(({ status, count }) => (
            <span key={status} className={`whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${MESSAGE_STATUS_META[status].className}`}>
              {count} {MESSAGE_STATUS_META[status].label.toLowerCase()}
            </span>
          ))}
          {live && <span className="text-xs text-n-400">Updating every few seconds…</span>}
        </div>
      )}

      <ul className="divide-y divide-n-100 rounded-xl border border-n-200 bg-white">
        {(batch.assignments ?? []).map((a) => (
          <li key={a.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3">
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-sm text-ink wrap-break-word">
                {a.student_name} <span className="font-mono text-xs text-n-400">{a.admission_number}</span>
              </p>
              <p className="text-xs text-n-500">
                <span className="font-mono">{a.serial}</span>
                {texted && a.phone ? ` · ${a.guardian_name || "Parent"} ${a.phone}` : ""}
                {a.superseded_at ? " · replaced since" : ""}
              </p>
              {a.mismatch && (
                <p className="flex items-center gap-1 text-xs text-clay">
                  <AlertTriangle className="size-3.5" /> Used to check a different student&rsquo;s results.
                </p>
              )}
            </div>
            {a.message_status && (
              <span className={`whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium ${MESSAGE_STATUS_META[a.message_status].className}`}>
                {MESSAGE_STATUS_META[a.message_status].label}
              </span>
            )}
          </li>
        ))}
      </ul>
      {texted && batch.student_count > 0 && (
        <p className="text-xs text-n-400">
          A text that stays &ldquo;Not confirmed&rdquo; or &ldquo;Failed&rdquo; shows up on Result Cards &rarr; Sent,
          where you can send it again or get its credits back.
        </p>
      )}
    </div>
  );
}
