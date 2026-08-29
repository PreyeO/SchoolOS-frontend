import type { SchoolAccessStatus } from "@/lib/school/get-school-detail";

// Status colours, not brand — same rule as every other badge in the app.
// `expired` is clay because it isn't a warning about something upcoming: that
// school's writes are already blocked.
const STYLES: Record<SchoolAccessStatus, string> = {
  trialing: "bg-amber/15 text-ink",
  subscribed: "bg-grass/10 text-grass",
  expired: "bg-clay/10 text-clay",
};

const LABELS: Record<SchoolAccessStatus, string> = {
  trialing: "Trial",
  subscribed: "Subscribed",
  expired: "Expired",
};

export function AccessBadge({ status }: { status: SchoolAccessStatus | undefined }) {
  if (!status) return null;
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${STYLES[status]}`}
    >
      {LABELS[status]}
    </span>
  );
}
