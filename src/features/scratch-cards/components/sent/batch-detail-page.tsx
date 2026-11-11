"use client";

import Link from "next/link";

import { ErrorState } from "@/components/shared/error-state";
import { useClasses } from "@/features/settings/hooks/use-classes";
import { formatTimestamp } from "@/lib/text/format-timestamp";

import { batchInFlight, useIssuanceBatch } from "../../hooks/use-issuance";
import { batchScopeName, batchTitle } from "../../lib/assignment-labels";
import { MESSAGE_STATUS_META, statusCounts } from "../../lib/message-status";
import { BatchAssignmentRow } from "./batch-assignment-row";

// /scratch-cards/batches/[id]: what a send was (first cards or replacements,
// for which class or arm), who it went to, and how each text is doing.
// Refreshes itself every few seconds while any text is queued or sending.
export function BatchDetailPage({ id }: { id: string }) {
  const { data: batch, isPending, isError, error } = useIssuanceBatch(id);
  const { data: classes = [] } = useClasses();
  const back = <Link href="/scratch-cards" className="text-sm text-primary hover:underline">← Result cards</Link>;

  if (isPending) return <div className="space-y-4">{back}<p className="text-sm text-n-400" role="status">Loading…</p></div>;
  if (isError) return <div className="space-y-4">{back}<ErrorState error={error} resourceLabel="this send" /></div>;

  const live = batchInFlight(batch);
  const texted = batch.channel === "sms";
  const assignments = batch.assignments ?? [];

  return (
    <div className="space-y-5">
      {back}
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">{batchTitle(batch)}</h1>
        <p className="mt-1 text-sm text-n-500">
          {batchScopeName(batch, classes)} · {batch.session_name} · {formatTimestamp(batch.created_at)}
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

      <ul className="divide-y divide-n-100 overflow-hidden rounded-xl border border-n-200 bg-white">
        {assignments.map((a) => <BatchAssignmentRow key={a.id} a={a} />)}
      </ul>

      {texted && assignments.length > 0 && (
        <p className="text-xs text-n-500">
          A text that stays &ldquo;Not confirmed&rdquo; or &ldquo;Failed&rdquo; shows at the top of Result cards, where
          you can send it again or get its credits back.
        </p>
      )}
    </div>
  );
}
