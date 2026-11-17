"use client";

import Link from "next/link";
import { AlertTriangle } from "lucide-react";

import { formatTimestamp } from "@/lib/text/format-timestamp";

import { REASON_LABEL } from "../../lib/assignment-labels";
import { MESSAGE_STATUS_META } from "../../lib/message-status";
import type { CardAssignment } from "../../types";

// One recipient of a send, using every field of the assignment that means
// something to a person: who (linked to their page), the card's serial, how it
// went out and to whom, why (first card or which kind of replacement), when,
// whether it has since been replaced, delivery, and a mismatch.
export function BatchAssignmentRow({ a }: { a: CardAssignment }) {
  const status = a.message_status ? MESSAGE_STATUS_META[a.message_status] : null;
  const how = a.channel === "sms" ? `Texted to ${a.guardian_name || "the parent"}${a.phone ? `, ${a.phone}` : ""}` : "Printed slip";

  return (
    <li className={`flex flex-wrap items-start gap-x-3 gap-y-2 px-4 py-3 ${a.superseded_at ? "bg-n-50/60" : ""}`}>
      <div className="min-w-0 flex-1 basis-60 space-y-1">
        <p className="text-sm font-semibold text-ink wrap-break-word">
          <Link href={`/students/${a.intended_student}`} className="text-ink hover:underline">{a.student_name}</Link>{" "}
          <span className="font-mono text-xs font-normal text-n-400">{a.admission_number}</span>
        </p>
        <p className="text-xs text-n-600 wrap-break-word">
          <span className="font-mono">{a.serial}</span> · {how}
        </p>
        <p className="text-xs text-n-500">
          {REASON_LABEL[a.reason]} · {formatTimestamp(a.assigned_at)}
        </p>
        {a.superseded_at && (
          <p className="text-xs font-medium text-n-600">
            Replaced on {formatTimestamp(a.superseded_at)}. This serial no longer works; see the student&rsquo;s page
            for the newer card.
          </p>
        )}
        {/* Shown, never acted on (per the handoff). */}
        {a.mismatch && (
          <p className="flex items-center gap-1 text-xs text-clay">
            <AlertTriangle className="size-3.5 shrink-0" aria-hidden /> Used to check a different student&rsquo;s results.
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {a.superseded_at && (
          <span className="whitespace-nowrap rounded-full border border-n-200 bg-white px-2 py-0.5 text-[11px] text-n-500">Replaced</span>
        )}
        {status && (
          <span className={`whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium ${status.className}`}>{status.label}</span>
        )}
      </div>
    </li>
  );
}
