import type { SchoolAccessStatus } from "@/lib/school/get-school-detail";

// Status colours, not brand colours — same rule as EnrollmentStatusBadge and
// InviteStatusBadge. `expired` is clay rather than amber: it isn't a warning
// about something upcoming, it's a state that has already stopped writes.
const STYLES: Record<SchoolAccessStatus, string> = {
  trialing: "bg-amber/15 text-ink",
  subscribed: "bg-grass/10 text-grass",
  expired: "bg-clay/10 text-clay",
};

const LABELS: Record<SchoolAccessStatus, string> = {
  trialing: "Trial",
  subscribed: "Active",
  expired: "Expired",
};

export function AccessStatusBadge({ status }: { status: SchoolAccessStatus | undefined }) {
  if (!status) return null;
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  );
}
