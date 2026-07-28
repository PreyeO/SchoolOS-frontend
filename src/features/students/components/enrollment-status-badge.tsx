import { enrollmentStatusLabel } from "../lib/labels";
import type { EnrollmentStatus } from "../types";

// Status colors, not brand colors — same rule as InviteStatusBadge/ActiveBadge.
const STYLES: Record<EnrollmentStatus, string> = {
  active: "bg-grass/10 text-grass",
  graduated: "bg-grass/10 text-grass",
  transferred: "bg-n-100 text-n-500",
  withdrawn: "bg-n-100 text-n-500",
  suspended: "bg-clay/10 text-clay",
  expelled: "bg-clay/10 text-clay",
};

export function EnrollmentStatusBadge({ status }: { status: EnrollmentStatus }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${STYLES[status]}`}>
      {enrollmentStatusLabel(status)}
    </span>
  );
}
