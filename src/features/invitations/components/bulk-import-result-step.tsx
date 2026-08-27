"use client";

import { useRouter } from "next/navigation";
import { Download, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

import { downloadBulkImportCredentials } from "../lib/bulk-import-credentials-csv";
import type { BulkImportResult } from "../types";
import { BulkImportAppliedTable } from "./bulk-import-applied-table";
import { BulkImportSkippedTable } from "./bulk-import-skipped-table";

interface Props {
  result: BulkImportResult;
  onImportAnother: () => void;
}

export function BulkImportResultStep({ result, onImportAnother }: Props) {
  const router = useRouter();
  const { applied, skipped } = result;
  const hasNewPasswords = applied.some((r) => r.password);

  return (
    <div className="space-y-4">
      {hasNewPasswords && (
        <div className="flex items-start gap-2.5 rounded-lg border border-clay/30 bg-clay/10 px-3.5 py-3">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-clay" />
          <p className="text-sm text-ink">
            Save these now — passwords for the new accounts below won&rsquo;t be shown again.
            Download the CSV to hand credentials out, or copy each one individually.
          </p>
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink">
          {applied.length} student{applied.length === 1 ? "" : "s"} created
        </p>
        {applied.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => downloadBulkImportCredentials(applied)}
            className="h-8 shrink-0 text-xs"
          >
            <Download className="size-3.5 mr-1" />
            Download credentials
          </Button>
        )}
      </div>

      {applied.length > 0 && <BulkImportAppliedTable rows={applied} stage="committed" />}
      {skipped.length > 0 && <BulkImportSkippedTable rows={skipped} />}

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onImportAnother} className="flex-1">
          Import another file
        </Button>
        <Button type="button" onClick={() => router.push("/students")} className="flex-1 font-semibold">
          Done
        </Button>
      </div>
    </div>
  );
}
