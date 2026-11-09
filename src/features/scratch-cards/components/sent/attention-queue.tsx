"use client";

import { useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { newIdempotencyKey } from "@/lib/api/idempotency-key";
import { formatTimestamp } from "@/lib/text/format-timestamp";

import { useOutboundMessages, useResolveMessage } from "../../hooks/use-issuance";
import { MESSAGE_STATUS_META, needsDecision } from "../../lib/message-status";
import type { OutboundMessage, ResolvePayload } from "../../types";

// Texts that need a decision: "Not confirmed" (the provider never said either
// way) and "Failed". Mark failed refunds the credits and sends nothing; Send
// again spends new credits on a fresh text and PIN. Renders nothing when the
// queue is empty, so the Sent tab stays quiet on a good day.
export function AttentionQueue() {
  const unknown = useOutboundMessages("unknown");
  const failed = useOutboundMessages("failed");
  const resolve = useResolveMessage();
  // One key per message and action, kept while the page is open: a retried
  // click is the same request, never a second refund or a second send.
  const keys = useRef(new Map<string, string>());
  const keyFor = (id: string, action: ResolvePayload["action"]) => {
    const k = `${id}:${action}`;
    if (!keys.current.has(k)) keys.current.set(k, newIdempotencyKey());
    return keys.current.get(k) as string;
  };

  // Resent this visit. The server leaves the ORIGINAL message unknown/failed
  // after a resend (it records the new text separately), so without this it
  // would sit here inviting a second, paid resend. Backend gap: see PROJECT.md.
  const [resent, setResent] = useState<Set<string>>(() => new Set());

  const rows = needsDecision([...(unknown.data?.results ?? []), ...(failed.data?.results ?? [])]).filter(
    (m) => !resent.has(m.id),
  );
  if (rows.length === 0) return null;
  const run = (m: OutboundMessage, action: ResolvePayload["action"]) =>
    resolve.mutate(
      { message_id: m.id, action, idempotency_key: keyFor(m.id, action) },
      { onSuccess: () => action === "resend" && setResent((s) => new Set(s).add(m.id)) },
    );

  return (
    <section className="space-y-2 rounded-xl border border-clay/30 bg-clay/5 p-4" aria-labelledby="attention-heading">
      <h2 id="attention-heading" className="flex items-center gap-2 text-sm font-semibold text-ink">
        <AlertTriangle className="size-4 text-clay" /> {rows.length} text{rows.length === 1 ? "" : "s"} need a decision
      </h2>
      <p className="text-xs text-n-600">
        &ldquo;Not confirmed&rdquo; means the SMS provider never said whether it arrived. Ask the parent: if it
        didn&rsquo;t, send again or mark it failed to get the credits back.
      </p>
      <ul className="divide-y divide-n-100 rounded-lg border border-n-200 bg-white">
        {rows.map((m) => (
          <li key={m.id} className="space-y-2 px-3 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium ${MESSAGE_STATUS_META[m.status].className}`}>
                {MESSAGE_STATUS_META[m.status].label}
              </span>
              <span className="font-mono text-xs text-n-600">{m.recipient_phone}</span>
              <span className="text-xs text-n-400">{formatTimestamp(m.created_at)}</span>
            </div>
            {/* The body names the student; it's the only link back to who this was for. */}
            <p className="text-sm text-ink wrap-break-word">{m.body}</p>
            {m.failure_reason && <p className="text-xs text-clay">{m.failure_reason}</p>}
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="outline" className="h-8 text-xs" disabled={resolve.isPending} onClick={() => run(m, "resend")}>
                Send again ({m.credits_charged} credit{m.credits_charged === 1 ? "" : "s"})
              </Button>
              {!m.credits_refunded && (
                <Button type="button" size="sm" variant="ghost" className="h-8 text-xs" disabled={resolve.isPending} onClick={() => run(m, "mark_failed")}>
                  Mark failed and refund
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
