"use client";

import { ArrowLeft, Download, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ReportCardBody } from "@/features/results/components/report-card-body";
import type { ReportCard } from "@/features/results/types";
import { fitReportCardPreview } from "@/features/results/lib/fit-report-card-preview";
import { getErrorMessage } from "@/lib/api/get-error-message";

interface Props {
  report: ReportCard;
  termName: string;
  sessionName: string;
  // The school's own template as HTML; null while loading, or if it failed
  // (then the plain data view stands in, so the result is never withheld).
  previewHtml: string | null;
  previewLoading: boolean;
  onDownload: () => void;
  downloading: boolean;
  downloadError: unknown;
  onAnotherTerm: () => void;
  onAnotherCard: () => void;
}

export function CheckResultView({
  report, termName, sessionName, previewHtml, previewLoading,
  onDownload, downloading, downloadError, onAnotherTerm, onAnotherCard,
}: Props) {
  const { student } = report;

  return (
    <div className="space-y-5">
      <button type="button" onClick={onAnotherCard} className="inline-flex items-center gap-1.5 text-sm text-n-500 hover:text-ink">
        <ArrowLeft className="size-4" /> Check a different card
      </button>

      <div className="flex flex-col gap-4 rounded-2xl border border-n-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-primary">
            {termName} · {sessionName}
          </p>
          <h1 className="mt-1 font-display text-2xl font-bold text-ink wrap-break-word">
            {student.user.first_name} {student.user.last_name}
          </h1>
          <p className="font-mono text-sm text-n-500">{student.admission_number}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={onDownload} disabled={downloading} className="h-11">
            <Download className="size-4" /> {downloading ? "Preparing PDF…" : "Download PDF"}
          </Button>
          <Button type="button" variant="outline" onClick={onAnotherTerm} className="h-11">
            <RotateCcw className="size-4" /> Another term
          </Button>
        </div>
      </div>

      {downloadError ? <p role="alert" className="text-sm text-clay">{getErrorMessage(downloadError)}</p> : null}

      {previewLoading ? (
        <p className="rounded-2xl border border-n-200 bg-white p-10 text-center text-sm text-n-400" role="status">
          Loading the report card…
        </p>
      ) : previewHtml ? (
        <div className="overflow-hidden rounded-2xl border border-n-200 bg-white">
          {/* sandbox="": the school's HTML runs no script and can't navigate. */}
          <iframe
            title={`${student.user.first_name} ${student.user.last_name} report card`}
            srcDoc={fitReportCardPreview(previewHtml)}
            sandbox=""
            className="h-[80dvh] w-full border-0"
          />
        </div>
      ) : (
        <div className="rounded-2xl border border-n-200 bg-white p-5">
          <ReportCardBody data={report} />
        </div>
      )}
    </div>
  );
}
