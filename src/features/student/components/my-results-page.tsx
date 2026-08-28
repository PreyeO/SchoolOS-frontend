"use client";

import { Hourglass } from "lucide-react";

import { ErrorState } from "@/components/shared/error-state";
import { OfflineNotice } from "@/components/shared/offline-notice";
import { TermPicker } from "@/components/shared/term-picker";
import { DownloadResultButton } from "@/features/academic-record/components/download-result-button";
import { NoTermsNotice } from "@/features/results/components/no-terms-notice";
import { ReportCardBody } from "@/features/results/components/report-card-body";
import { TermBadge } from "@/features/results/components/term-badge";
import { useReportCard } from "@/features/results/hooks/use-report-card";
import { isPermissionDeniedError } from "@/lib/api/get-error-message";
import { useTermSelection } from "@/lib/school/use-term-selection";

import { useMyStudentId } from "../hooks/use-my-student-id";
import { studentScreenGuard } from "./student-screen-guard";

// A student's own report card, term by term.
//
// Identical permission story to the parent's: ResultsService.get_report_card
// has an is_self branch that admits the student outright, but only once the
// arm's broadsheet is locked — so a 403 here means "not published yet", not
// "not allowed", and gets a waiting state rather than ErrorState. Verified
// live: the body is {"detail":"This report card is not yet available."}.
export function MyResultsPage() {
  const term = useTermSelection();
  const { studentId, isPending } = useMyStudentId();
  const report = useReportCard(studentId, term.periodId);

  const guard = studentScreenGuard(studentId, isPending || term.isPending);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">My results</h1>
          <p className="mt-1 text-sm text-n-500">
            Your scores, grades and class position for each term.
          </p>
        </div>
        {term.label && <TermBadge label={term.label} isCurrent={term.isViewingCurrentTerm} />}
      </div>

      {guard ?? (
        <>
          {term.isPaused && !term.hasTerms ? (
            <OfflineNotice resourceLabel="Results" />
          ) : !term.hasTerms ? (
            <NoTermsNotice consequence="there are no results to show yet" />
          ) : (
            <>
              <TermPicker
                groups={term.groups}
                value={term.periodId}
                onChange={term.setPeriodId}
                label="Term"
              />

              {report.isPaused && !report.data ? (
                <OfflineNotice resourceLabel="This result" />
              ) : report.isPending ? (
                <p className="py-8 text-center text-sm text-n-400" role="status">
                  Loading result…
                </p>
              ) : report.isError ? (
                isPermissionDeniedError(report.error) ? (
                  <div className="rounded-xl border border-n-200 bg-white p-8 text-center">
                    <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-n-100">
                      <Hourglass className="size-5 text-n-400" />
                    </div>
                    <h2 className="mt-4 font-display text-lg font-semibold text-ink">
                      {term.label ?? "This term"} isn&rsquo;t published yet
                    </h2>
                    <p className="mx-auto mt-1.5 max-w-sm text-sm text-n-500">
                      Your result appears here as soon as your school releases it for
                      the class. Nothing is missing on your side.
                    </p>
                  </div>
                ) : (
                  <ErrorState error={report.error} resourceLabel="this result" />
                )
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <DownloadResultButton
                      studentId={studentId!}
                      periodId={term.periodId}
                      admissionNumber={report.data.student.admission_number}
                      label="Download my result"
                    />
                  </div>
                  <div className="rounded-xl border border-n-200 bg-white p-4 sm:p-5">
                    <ReportCardBody data={report.data} />
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
