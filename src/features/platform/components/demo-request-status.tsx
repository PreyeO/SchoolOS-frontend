"use client";

import { Select } from "@/components/ui/select";

import { useUpdateDemoRequestStatus } from "../hooks/use-demo-requests";
import { DEMO_REQUEST_STATUSES, type DemoRequestStatus } from "../types-demo-requests";

// Status colours, not brand — same rule as every other badge in the app.
// converted is grass because it's the outcome worth having; declined is muted
// rather than red, since a school saying "not this term" isn't a failure state.
const STYLES: Record<DemoRequestStatus, string> = {
  pending: "bg-amber/15 text-ink",
  contacted: "bg-primary/10 text-primary",
  converted: "bg-grass/10 text-grass",
  declined: "bg-n-100 text-n-500",
};

const LABELS: Record<DemoRequestStatus, string> = {
  pending: "Pending",
  contacted: "Contacted",
  converted: "Converted",
  declined: "Declined",
};

export function DemoRequestBadge({ status }: { status: DemoRequestStatus }) {
  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  );
}

// Editable inline rather than behind a dialog. Working a lead list means
// changing one field on many rows, and a confirmation step per row would make
// the common action the slow one. It's the only mutable field, and it's
// reversible, so there's nothing to guard against.
export function DemoRequestStatusSelect({
  id,
  status,
}: {
  id: string;
  status: DemoRequestStatus;
}) {
  const update = useUpdateDemoRequestStatus();

  return (
    <Select
      aria-label="Lead status"
      className="h-8 w-auto"
      value={status}
      disabled={update.isPending}
      onChange={(e) => update.mutate({ id, status: e.target.value as DemoRequestStatus })}
    >
      {DEMO_REQUEST_STATUSES.map((s) => (
        <option key={s} value={s}>
          {LABELS[s]}
        </option>
      ))}
    </Select>
  );
}
