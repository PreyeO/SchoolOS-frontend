"use client";

import { AlertTriangle } from "lucide-react";

import { formatTimestamp } from "@/lib/text/format-timestamp";

import Link from "next/link";

import { useStudentCardHistory } from "../hooks/use-scratch-card-queries";
import { REASON_LABEL } from "../lib/assignment-labels";
import { MESSAGE_STATUS_META } from "../lib/message-status";

// Every card this student was given, newest first. The top live row is the
// card they hold now; a row with superseded_at was replaced by the one above.
export function StudentCardHistory({ studentId }: { studentId: string }) {
  const { data, isPending, isError } = useStudentCardHistory(studentId);

  if (isPending) return <p className="text-sm text-n-400" role="status">Loading cards…</p>;
  if (isError) return <p className="text-sm text-clay">Couldn&rsquo;t load this student&rsquo;s cards.</p>;
  if (data.length === 0) {
    return <p className="text-sm text-n-400 italic">No result card has been issued to this student yet.</p>;
  }

  return (
    <ol className="divide-y divide-n-100 rounded-lg border border-n-200">
      {data.map((a) => (
        // A tint, not opacity: dimmed 11-12px grey text would drop below 4.5:1.
        <li key={a.id} className={`space-y-1 px-3 py-2.5 ${a.superseded_at ? "bg-n-50" : ""}`}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm text-ink">{a.serial}</span>
            <span className="text-xs text-n-500">{REASON_LABEL[a.reason]}</span>
            {a.superseded_at ? (
              <span className="whitespace-nowrap rounded-full border border-n-200 px-2 py-0.5 text-[11px] text-n-500">Replaced</span>
            ) : (
              <span className="whitespace-nowrap rounded-full border border-grass/30 bg-grass/10 px-2 py-0.5 text-[11px] font-medium text-grass">Current</span>
            )}
            {a.message_status && (
              <span className={`whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium ${MESSAGE_STATUS_META[a.message_status].className}`}>
                {MESSAGE_STATUS_META[a.message_status].label}
              </span>
            )}
          </div>
          <p className="text-xs text-n-500 wrap-break-word">
            {a.channel === "sms" ? `Texted to ${a.guardian_name || "parent"}${a.phone ? ` (${a.phone})` : ""}` : "Printed slip"}
            {" · "}
            {formatTimestamp(a.assigned_at)}
            {a.issuance_batch && (
              <>
                {" · "}
                <Link href={`/scratch-cards/batches/${a.issuance_batch}`} className="text-primary hover:underline">View send</Link>
              </>
            )}
          </p>
          {a.superseded_at && (
            <p className="text-xs text-n-600">Replaced on {formatTimestamp(a.superseded_at)}; this serial no longer works.</p>
          )}
          {/* Shown, never acted on: the handoff says not to block or offer an action. */}
          {a.mismatch && (
            <p className="flex items-center gap-1 text-xs text-clay">
              <AlertTriangle className="size-3.5 shrink-0" aria-hidden /> This card was used to check a different student&rsquo;s results.
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
