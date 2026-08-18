"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getErrorMessage, isPermissionDeniedError } from "@/lib/api/get-error-message";

import { useReportCard } from "../hooks/use-report-card";
import { ReportCardBody } from "./report-card-body";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  studentName: string;
  academicPeriodId: string;
}

// The structured report card, not the printed one.
//
// Deliberately not the HTML preview: that renders the school's chosen template
// and is for checking how the *print* will look. This answers a different
// question — what does this child's result actually say — so it's read as data,
// with positions and averages legible rather than typeset.
export function ReportCardDialog({
  open,
  onOpenChange,
  studentId,
  studentName,
  academicPeriodId,
}: Props) {
  const { data, isPending, isError, error } = useReportCard(
    open ? studentId : null,
    academicPeriodId,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{studentName}</DialogTitle>
        </DialogHeader>

        {isPending ? (
          <p className="py-8 text-center text-sm text-n-400" role="status">Loading result…</p>
        ) : isError ? (
          <p className="py-8 text-center text-sm text-clay">
            {/* Not ErrorState: a 403 here has a specific, reassuring meaning —
                the result exists and simply isn't released yet — which the
                shared "you don't have permission" copy would misrepresent. */}
            {isPermissionDeniedError(error)
              ? "This result isn't visible yet — it becomes available once the class is published."
              : getErrorMessage(error)}
          </p>
        ) : (
          <ReportCardBody data={data} />
        )}
      </DialogContent>
    </Dialog>
  );
}
