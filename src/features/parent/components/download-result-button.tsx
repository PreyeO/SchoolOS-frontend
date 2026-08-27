"use client";

import { FileDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useDownloadReportCard } from "@/features/results/hooks/use-report-card-export";

interface Props {
  studentId: string;
  periodId: string | null;
  admissionNumber: string;
}

// The printable report card, in the school's own template.
//
// ReportCardRenderService resolves ReportCardSettings for the student's level
// — template, fonts, logo placement, enabled sections — so a parent downloads
// exactly the document the admin designed under Settings › Report Card
// Templates, not a frontend approximation of it.
//
// Reuses the admin screen's own mutation unchanged: getReportCardPdf takes a
// bare studentId, and the endpoint applies the same visibility rule as the
// JSON report card (linked parent, published term only). By the time this
// renders, the JSON call has already succeeded, so the PDF will too.
export function DownloadResultButton({ studentId, periodId, admissionNumber }: Props) {
  const download = useDownloadReportCard();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={!periodId || download.isPending}
      onClick={() =>
        periodId && download.mutate({ studentId, periodId, admissionNumber })
      }
      className="h-8 text-xs"
    >
      <FileDown className="size-3.5 mr-1" />
      {download.isPending ? "Preparing…" : "Download result"}
    </Button>
  );
}
