"use client";

import { X } from "lucide-react";

import type { StudentListItem } from "@/features/students/types";

import type { BulkMarkResponse } from "../types";

interface Props {
  skipped: BulkMarkResponse["skipped"];
  students: StudentListItem[] | undefined;
  onDismiss: () => void;
}

// A toast is the wrong shape for this: a background flush can land while the
// teacher is on another screen, and a report that disappears after four seconds
// isn't a report. The panel stays until dismissed.
//
// The API returns only student_id, so names are resolved from the roster that's
// already cached for this arm — the same data the register is drawn from.
export function SkippedMarksPanel({ skipped, students, onDismiss }: Props) {
  if (skipped.length === 0) return null;

  const nameById = new Map(
    (students ?? []).map((s) => [s.id, `${s.user.first_name} ${s.user.last_name}`]),
  );

  return (
    <div className="rounded-lg border border-amber/40 bg-amber/10 px-3.5 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">
            {skipped.length} mark{skipped.length === 1 ? "" : "s"} weren&rsquo;t applied
          </p>
          <p className="mt-0.5 text-xs text-n-600">
            Someone marked {skipped.length === 1 ? "this student" : "these students"} more
            recently, so the newer mark was kept. Check the register and re-mark if yours
            was the correct one.
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Dismiss"
          className="shrink-0 text-n-400 transition-colors hover:text-ink"
        >
          <X className="size-4" />
        </button>
      </div>

      <ul className="mt-2.5 space-y-1">
        {skipped.map((entry) => (
          <li key={entry.student_id} className="text-xs text-ink">
            <span className="font-medium">
              {/* A student who has since transferred out won't be on this
                  roster; their id is better than nothing. */}
              {nameById.get(entry.student_id) ?? "A student no longer in this class"}
            </span>
            <span className="text-n-500"> — {entry.reason}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
