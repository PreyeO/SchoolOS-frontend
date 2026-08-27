"use client";

import { AlertTriangle, CheckCircle2 } from "lucide-react";

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

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Choose a different file
        </Button>
        {applied.length > 0 && (
          <Button type="button" onClick={onConfirm} disabled={isPending} className="flex-1 font-semibold">
            {isPending ? "Importing…" : `Create ${applied.length} student${applied.length === 1 ? "" : "s"}`}
          </Button>
        )}
      </div>
    </div>
  );
}
