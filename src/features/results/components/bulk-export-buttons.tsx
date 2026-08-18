"use client";

import { FileDown, FolderArchive } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useDownloadClassReportCards } from "../hooks/use-report-card-export";

interface Props {
  classArmId: string;
  periodId: string;
  armLabel: string;
}

// Enrollment-scoped, not score-scoped: the backend builds the batch from who is
// currently enrolled in the arm for the session, so it works before publishing
// (staff may preview) and a transferred student simply isn't in it.
export function BulkExportButtons({ classArmId, periodId, armLabel }: Props) {
  const downloadAll = useDownloadClassReportCards();

  const formats = [
    { format: "pdf" as const, icon: FileDown, label: "All as one PDF" },
    { format: "zip" as const, icon: FolderArchive, label: "ZIP of each" },
  ];

  return (
    <>
      {formats.map(({ format, icon: Icon, label }) => (
        <Button
          key={format}
          type="button"
          variant="outline"
          size="sm"
          disabled={downloadAll.isPending}
          onClick={() => downloadAll.mutate({ classArmId, periodId, exportFormat: format, armLabel })}
          className="h-8 shrink-0 text-xs"
        >
          <Icon className="size-3.5 mr-1" />
          {downloadAll.isPending && format === "pdf" ? "Preparing…" : label}
        </Button>
      ))}
    </>
  );
}
