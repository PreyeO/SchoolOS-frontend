import type { InviteStatus } from "../types";

// Status colors, not brand colors — same rule as KPI trend arrows and
// checklist checkmarks elsewhere: pending/accepted/expired are semantic
// states, unrelated to the school's primary/accent colors.
const STYLES: Record<InviteStatus, string> = {
  pending: "bg-n-100 text-n-500",
  accepted: "bg-grass/10 text-grass",
  invalidated: "bg-n-200 text-n-600",
  expired: "bg-clay/10 text-clay",
};

const LABELS: Record<InviteStatus, string> = {
  pending: "Pending",
  accepted: "Accepted",
  invalidated: "Invalidated",
  expired: "Expired",
};

export function InviteStatusBadge({ status }: { status: InviteStatus }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  );
}
