"use client";

import { ErrorState } from "@/components/shared/error-state";
import { TermPicker } from "@/components/shared/term-picker";
import { NoTermsNotice } from "@/features/results/components/no-terms-notice";
import { ReportCardBody } from "@/features/results/components/report-card-body";
import { useReportCard } from "@/features/results/hooks/use-report-card";
import { useIsTeacher } from "@/lib/auth/use-personas";
import { useHasSchoolPermission } from "@/lib/auth/use-school-permission";
import { useTermSelection } from "@/lib/school/use-term-selection";

// This student's results, defaulting to the current term and filterable to any
// other — GET /api/students/:id/report-card/?academic_period_id=.
//
// "Last result" is read as "the current term" rather than "the most recently
// PUBLISHED one": the endpoint takes one required period and has no "give me
// the latest" mode, so finding the last published result automatically would
// mean probing every period from newest to oldest until one returns a locked
// summary — an N-request cost to pick a default, for a fact the TermPicker
// already lets anyone find in one click. If a school genuinely wants the
// backward search, that's a real feature (and a real endpoint) to scope
// separately, not a default worth guessing at here.
export function StudentResultsSection({ studentId }: { studentId: string }) {
  const term = useTermSelection();

  // Mirrors ResultsService.get_report_card's own is_privileged check exactly:
  // admin with view_results, or any teacher. Gating the fetch on it (rather
  // than letting a 403 arrive and guessing what it means) matters here — a
  // student's OWN detail page is reachable by an admin holding view_students
  // but not view_results, and for that caller a 403 is a genuine permission
  // gap, not "not published yet". ReportCardDialog's blanket "not visible yet"
  // copy is right for a parent/student caller (the only one it serves) but
  // would be a wrong diagnosis here, so this doesn't reuse it.
  const isTeacher = useIsTeacher();
  const hasViewResults = useHasSchoolPermission("view_results");
  const canView = isTeacher || hasViewResults;

  const report = useReportCard(canView ? studentId : null, term.periodId);

  if (!canView) {
    return (
      <p className="text-sm text-clay" role="alert">
        You don&rsquo;t have permission to view results.
      </p>
    );
  }

  if (term.isPending) {
    return (
      <p className="text-sm text-n-400" role="status">
        Loading terms…
      </p>
    );
  }

  if (!term.hasTerms) {
    return <NoTermsNotice consequence="there are no results to show" />;
  }

  return (
    <div className="space-y-4">
      <TermPicker groups={term.groups} value={term.periodId} onChange={term.setPeriodId} label="Term" />

      {report.isPending ? (
        <p className="text-sm text-n-400" role="status">
          Loading result…
        </p>
      ) : report.isError ? (
        <ErrorState error={report.error} resourceLabel="this student's result" />
      ) : (
        <ReportCardBody data={report.data} />
      )}
    </div>
  );
}
