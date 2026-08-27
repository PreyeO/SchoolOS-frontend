"use client";

import { ArmPicker } from "@/components/shared/arm-picker";
import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { getErrorMessage, isValidationError } from "@/lib/api/get-error-message";
import type { ArmOptionGroup } from "@/lib/school/arm-options";

import type { PromotionDraftRow } from "../hooks/use-promotion-draft";
import { PromotionRow } from "./promotion-row";

interface Props {
  rows: PromotionDraftRow[];
  armGroups: ArmOptionGroup[];
  isPending: boolean;
  isError: boolean;
  error: unknown;
  unresolved: number;
  onSetAll: (armId: string) => void;
  onDestinationChange: (studentId: string, armId: string) => void;
  onToggle: (studentId: string) => void;
}

// The preview roster, with a bulk destination control above it.
//
// The API takes one destination per student, so strictly every row needs its
// own. In practice an arm moves as a body with two or three exceptions, and
// forty identical dropdowns is how mistakes get made — so "send everyone to"
// fills them all and the per-row pickers become the exception handler.
export function PromotionList({
  rows,
  armGroups,
  isPending,
  isError,
  error,
  unresolved,
  onSetAll,
  onDestinationChange,
  onToggle,
}: Props) {
  if (isPending) {
    return <p className="text-sm text-n-400" role="status">Loading students…</p>;
  }
  if (isError) {
    // get_promotion_preview's own 400s ("Source and target session must be
    // different.", "No current academic session is set…") are specific,
    // actionable refusals, not a load failure — ErrorState's generic
    // "couldn't load" fallback would swallow the exact text that tells the
    // admin what to change, and its retry button could never fix a rejection
    // caused by the input itself. 403s and unreachable-server cases are
    // unaffected and still fall through to ErrorState's own handling of those.
    if (isValidationError(error)) {
      return (
        <p role="alert" className="rounded-xl border border-amber/40 bg-amber/10 px-3.5 py-2.5 text-sm text-ink">
          {getErrorMessage(error)}
        </p>
      );
    }
    return <ErrorState error={error} resourceLabel="this promotion preview" />;
  }
  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-n-200 bg-white p-8 text-center text-sm text-n-400 italic">
        Nobody is enrolled in this class for the session they&rsquo;d be leaving.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-n-200 bg-white">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-n-100 px-5 py-3">
        <span className="mr-auto text-xs text-n-500">
          {rows.length} student{rows.length === 1 ? "" : "s"}
          {unresolved > 0 && (
            <span className="text-amber">
              {" · "}
              {unresolved} need{unresolved === 1 ? "s" : ""} a destination
            </span>
          )}
        </span>
        <span className="flex items-center gap-2">
          <span className="text-xs text-n-500">Send everyone to</span>
          <ArmPicker
            id="promotion-set-all"
            groups={armGroups}
            value={null}
            onChange={onSetAll}
            placeholder="Choose class…"
          />
        </span>
      </div>

      <ul className="divide-y divide-n-100">
        {rows.map((row) => (
          <PromotionRow
            key={row.item.student.id}
            row={row}
            armGroups={armGroups}
            onDestinationChange={(armId) => onDestinationChange(row.item.student.id, armId)}
            onToggle={() => onToggle(row.item.student.id)}
          />
        ))}
      </ul>
    </div>
  );
}

// Kept out of the list so the page can place it as a sticky footer later
// without moving the roster.
export function PromotionSubmitBar({
  count,
  isPending,
  onSubmit,
}: {
  count: number;
  isPending: boolean;
  onSubmit: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <span className="mr-auto text-xs text-n-400">
        {count === 0
          ? "Tick the students to promote."
          : `${count} selected. Anyone left unticked stays where they are.`}
      </span>
      <Button type="button" onClick={onSubmit} disabled={count === 0 || isPending}>
        {isPending ? "Promoting…" : `Promote ${count || ""}`.trim()}
      </Button>
    </div>
  );
}
