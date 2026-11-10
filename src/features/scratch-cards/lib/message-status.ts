import type { IssuanceBatch, MessageStatus, OutboundMessage } from "../types";

// What each delivery state means to an admin. "unknown" is the one that needs
// a decision: the provider never confirmed either way, so the credits may or
// may not have bought a delivered text.
export const MESSAGE_STATUS_META: Record<MessageStatus, { label: string; className: string }> = {
  pending: { label: "Queued", className: "border-n-200 bg-n-50 text-n-600" },
  sending: { label: "Sending", className: "border-amber/40 bg-amber/10 text-ink" },
  sent: { label: "Sent", className: "border-grass/30 bg-grass/5 text-grass" },
  delivered: { label: "Delivered", className: "border-grass/30 bg-grass/10 text-grass" },
  failed: { label: "Failed", className: "border-clay/30 bg-clay/10 text-clay" },
  unknown: { label: "Not confirmed", className: "border-clay/30 bg-white text-clay" },
  // Closed by a resend: a newer text replaced it, so nothing to decide here.
  resolved: { label: "Sent again", className: "border-n-200 bg-white text-n-500" },
};

// "Class", "3 chosen students"… The list has no names (scope_detail is ids),
// so this is the honest summary.
export function batchScopeLabel(batch: Pick<IssuanceBatch, "scope" | "student_count">): string {
  switch (batch.scope) {
    case "school":
      return "Whole school";
    case "class":
      return "One class";
    case "arm":
      return "One arm";
    case "selection":
      return batch.student_count === 1 ? "1 student" : `${batch.student_count} chosen students`;
  }
}

// The messages still awaiting a decision. Unknown always is. Failed only until
// its credits are refunded: a failed-and-refunded text is decided (that's what
// "Mark failed" produces), and keeping it would list it forever.
export function needsDecision(messages: OutboundMessage[]): OutboundMessage[] {
  return messages.filter((m) => m.status === "unknown" || (m.status === "failed" && !m.credits_refunded));
}

// Counts per status for a batch's recipients, in the order they progress.
export function statusCounts(batch: IssuanceBatch): { status: MessageStatus; count: number }[] {
  const order: MessageStatus[] = ["pending", "sending", "sent", "delivered", "failed", "unknown", "resolved"];
  const counts = new Map<MessageStatus, number>();
  for (const a of batch.assignments ?? []) {
    if (a.message_status) counts.set(a.message_status, (counts.get(a.message_status) ?? 0) + 1);
  }
  return order.filter((s) => counts.has(s)).map((status) => ({ status, count: counts.get(status) ?? 0 }));
}
