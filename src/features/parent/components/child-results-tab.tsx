"use client";

import { Hourglass } from "lucide-react";

import { ErrorState } from "@/components/shared/error-state";
import { OfflineNotice } from "@/components/shared/offline-notice";
import { isPermissionDeniedError } from "@/lib/api/get-error-message";
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
// once the arm's broadsheet is locked, and 403s before that.
//
// So a 403 here is the ordinary pre-publish state, not a permission problem —
// it gets its own waiting state rather than ErrorState, whose "you don't have
// permission" wording would read as something wrong with the account.
export function ChildResultsTab({ studentId, periodId, termLabel }: Props) {
  const { data, isPending, isPaused, isError, error } = useReportCard(studentId, periodId);

  if (isPaused && !data) {
    return <OfflineNotice resourceLabel="This result" />;
  }

  if (isPending) {
    return (
      <p className="py-8 text-center text-sm text-n-400" role="status">
        Loading result…
      </p>
    );
  }

  if (isError) {
    if (!isPermissionDeniedError(error)) {
      return <ErrorState error={error} resourceLabel="this result" />;
    }
    return (
      <div className="rounded-xl border border-n-200 bg-white p-8 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-n-100">
          <Hourglass className="size-5 text-n-400" />
        </div>
        <h3 className="mt-4 font-display text-lg font-semibold text-ink">
          {termLabel} isn&rsquo;t published yet
        </h3>
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-n-500">
          Results appear here as soon as the school releases them for the class.
          Nothing is missing on your side.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-n-200 bg-white p-4 sm:p-5">
      <ReportCardBody data={data} />
    </div>
  );
}
