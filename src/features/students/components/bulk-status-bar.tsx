"use client";

import { Button } from "@/components/ui/button";

import { commonTargets } from "../lib/enrollment-status";
import type { EnrollmentStatus } from "../types";
import { ChangeStatusDialog } from "./change-status-dialog";

interface Props {
  students: { id: string; status: EnrollmentStatus }[];
  onClear: () => void;
}

// Appears once anything is ticked in the directory. One status and one reason
// for the whole batch, mirroring the endpoint.
export function BulkStatusBar({ students, onClear }: Props) {
  const n = students.length;
  // A batch containing anyone who has already left has no legal target at all
  // (terminal is one-way), and the endpoint would reject the lot. Say so here
  // rather than opening a dialog with an empty picker.
  const blocked = commonTargets(students.map((s) => s.status)).length === 0;

  return (
    <div
      role="region"
      aria-label="Bulk actions"
      className="flex flex-wrap items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5"
    >
      <p className="text-sm font-medium text-ink" aria-live="polite">
        {n} selected
      </p>
      {blocked ? (
        <p className="text-xs text-n-500">
          Some of these students have already left the school, so their status can&rsquo;t
          change. Untick them to continue.
        </p>
      ) : (
        <ChangeStatusDialog
          subject={n === 1 ? "1 student" : `${n} students`}
          students={students}
          onDone={onClear}
          trigger={
            <Button type="button" size="sm">
              Change status
            </Button>
          }
        />
      )}
      <Button type="button" variant="ghost" size="sm" className="ml-auto" onClick={onClear}>
        Clear selection
      </Button>
    </div>
  );
}
