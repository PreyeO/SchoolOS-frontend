"use client";

import { OfflineNotice } from "@/components/shared/offline-notice";
import { getErrorMessage, isPermissionDeniedError } from "@/lib/api/get-error-message";
import { ReportCardBody } from "@/features/results/components/report-card-body";
import { useReportCard } from "@/features/results/hooks/use-report-card";

interface Props {
  studentId: string;
  periodId: string | null;
  termLabel: string;
}

// A parent reads the report card straight from the endpoint, with no
// client-side permission check first.
//
// That's deliberate, and the opposite of student-results-section.tsx, which
// gates on view_results-or-teacher before fetching. A parent holds no school
// permission at all, so gating that way would hide the screen from the only
// person it's for. ResultsService.get_report_card already decides: it allows a
// linked parent (re-checking ParentStudentLink live on every request) but only
// once the arm's broadsheet is locked, and 403s before that. So here a 403 is
// the ordinary pre-publish state, not a permission problem — hence the specific
// copy rather than the shared ErrorState, whose "you don't have permission"
// wording would misread as something being wrong with the account.
export function ChildResultsTab({ studentId, periodId, termLabel }: Props) {
  const { data, isPending, isPaused, isError, error } = useReportCard(studentId, periodId);

  if (isPaused && !data) {
    return <OfflineNotice resourceLabel="This result" />;
  }

  if (isPending) {
    return <p className="text-sm text-n-400" role="status">Loading result…</p>;
  }

  if (isError) {
    return (
      <p className="rounded-xl border border-n-200 bg-white p-6 text-center text-sm text-n-500">
        {isPermissionDeniedError(error)
          ? `${termLabel}'s result isn't published yet. It appears here once the school releases it.`
          : getErrorMessage(error)}
      </p>
    );
  }

  return <ReportCardBody data={data} />;
}
