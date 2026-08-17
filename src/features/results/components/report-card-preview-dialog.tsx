"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getErrorMessage } from "@/lib/api/get-error-message";

import { useReportCardPreview } from "../hooks/use-report-card";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
  academicPeriodId: string;
}

// The rendered card itself — the school's chosen template, fonts, logo
// placement, colors — as opposed to ReportCardDialog, which shows the same
// data as a plain table. This is what "preview report card" means to a
// school: how it will look, not what it says.
//
// Fetched as text and injected via srcDoc rather than pointed at with a bare
// iframe src, for the same reason as the PDF download: the endpoint needs the
// bearer token, and an iframe src request carries no Authorization header.
//
// This is a browser render of the same HTML WeasyPrint turns into the PDF —
// close enough to check colors, fonts, sections and logo placement, but paged
// media (page breaks, footers, print margins) only exists in the actual PDF.
// It is not a pixel-accurate print preview, so the dialog says that plainly
// rather than let a screenshot of this be mistaken for the final document.
export function ReportCardPreviewDialog({
  open,
  onOpenChange,
  studentId,
  studentName,
  academicPeriodId,
}: Props) {
  const { data: html, isPending, isError, error } = useReportCardPreview(
    studentId,
    academicPeriodId,
    open,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-4xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>{studentName} — report card preview</DialogTitle>
        </DialogHeader>

        <p className="text-xs text-n-400">
          A preview of colors, fonts, sections and logo placement — not a pixel-accurate copy of
          the printed PDF, which paginates differently.
        </p>

        <div className="min-h-0 flex-1 overflow-hidden rounded-lg border border-n-200 bg-n-50">
          {isPending ? (
            <p className="p-8 text-center text-sm text-n-400" role="status">
              Rendering preview…
            </p>
          ) : isError ? (
            <p className="p-8 text-center text-sm text-clay">{getErrorMessage(error)}</p>
          ) : (
            <iframe
              title={`${studentName} report card preview`}
              srcDoc={html}
              sandbox=""
              className="size-full border-0 bg-white"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
