"use client";

import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { BulkImportResult } from "../types";
import { BulkImportAppliedTable } from "./bulk-import-applied-table";
import { BulkImportSkippedTable } from "./bulk-import-skipped-table";

interface Props {
  result: BulkImportResult;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

// Nothing here is committed yet — this is UserService.bulk_import_students
// run with commit=False, so re-uploading a fixed file just calls preview
// again rather than needing an "undo".
export function BulkImportPreviewStep({ result, isPending, onConfirm, onCancel }: Props) {
  const { applied, skipped } = result;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="flex items-center gap-1.5 text-grass">
          <CheckCircle2 className="size-4" /> {applied.length} ready
        </span>
        {skipped.length > 0 && (
          <span className="flex items-center gap-1.5 text-amber">
            <AlertTriangle className="size-4" /> {skipped.length} skipped
          </span>
        )}
      </div>

      {applied.length > 0 && <BulkImportAppliedTable rows={applied} stage="preview" />}
      {skipped.length > 0 && <BulkImportSkippedTable rows={skipped} />}

      {applied.length === 0 ? (
        <p className="rounded-xl border border-n-200 bg-white p-6 text-center text-sm text-n-400 italic">
          Nothing to import — fix the rows above in the CSV and choose it again.
        </p>
      ) : null}

      {/* Commit hashes a password per new student, so a few hundred rows takes
          30-90+ seconds. A spinning button alone reads as a hang at that
          length, and an admin who reloads or navigates away mid-write has no
          way to recover the generated passwords — so the wait is named, and
          leaving is explicitly warned against. */}
      {isPending && (
        <p
          role="status"
          className="flex items-start gap-2.5 rounded-lg border border-primary/30 bg-primary/5 px-3.5 py-3 text-sm text-ink"
        >
          <Loader2 className="mt-0.5 size-4 shrink-0 animate-spin text-primary" />
          <span>
            Creating {applied.length} student{applied.length === 1 ? "" : "s"}. This can take a
            minute or two for a large file — <strong>keep this page open</strong> so you can
            save the passwords when it finishes.
          </span>
        </p>
      )}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
          className="flex-1"
        >
          Choose a different file
        </Button>
        {applied.length > 0 && (
          <Button type="button" onClick={onConfirm} disabled={isPending} className="flex-1 font-semibold">
            {isPending
              ? "Importing…"
              : `Create ${applied.length} student${applied.length === 1 ? "" : "s"}`}
          </Button>
        )}
      </div>
    </div>
  );
}
