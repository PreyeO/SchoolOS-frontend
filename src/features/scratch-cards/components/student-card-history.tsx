"use client";

import { AlertTriangle } from "lucide-react";

import { formatTimestamp } from "@/lib/text/format-timestamp";

import { useStudentCardHistory } from "../hooks/use-scratch-card-queries";
import { MESSAGE_STATUS_META } from "../lib/message-status";
import type { AssignmentReason } from "../types";

const REASON: Record<AssignmentReason, string> = {
  issued: "Issued",
  lost: "Replaced: lost",
  never_arrived: "Replaced: never arrived",
  resend: "Sent again",
};

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
        <li key={a.id} className={`space-y-1 px-3 py-2.5 ${a.superseded_at ? "opacity-60" : ""}`}>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm text-ink">{a.serial}</span>
            <span className="text-xs text-n-500">{REASON[a.reason]}</span>
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
          </p>
          {/* Shown, never acted on: the handoff says not to block or offer an action. */}
          {a.mismatch && (
            <p className="flex items-center gap-1 text-xs text-clay">
              <AlertTriangle className="size-3.5 shrink-0" /> This card was used to check a different student&rsquo;s results.
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}
