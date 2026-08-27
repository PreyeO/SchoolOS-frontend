"use client";

import { Hourglass } from "lucide-react";

import { ErrorState } from "@/components/shared/error-state";
import { OfflineNotice } from "@/components/shared/offline-notice";
import { TermPicker } from "@/components/shared/term-picker";
import { NoTermsNotice } from "@/features/results/components/no-terms-notice";
import { ReportCardBody } from "@/features/results/components/report-card-body";
import { TermBadge } from "@/features/results/components/term-badge";
import { useReportCard } from "@/features/results/hooks/use-report-card";
import { isPermissionDeniedError } from "@/lib/api/get-error-message";
import { useTermSelection } from "@/lib/school/use-term-selection";

import { useChildStudent } from "../hooks/use-child-student";
import { useSelectedChild } from "../hooks/use-selected-child";
import { ChildContextBar } from "./child-context-bar";
import { childScreenGuard } from "./child-screen-guard";
import { SubjectScoresChart } from "./charts/subject-scores-chart";

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
export function ChildResultsPage() {
  const term = useTermSelection();
  const selected = useSelectedChild();
  const childId = selected.child?.student_id;
  const { student } = useChildStudent(childId, term.periodId);
  const report = useReportCard(childId, term.periodId);

  const guard = childScreenGuard(selected);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Results</h1>
        <p className="mt-1 text-sm text-n-500">
          Subject scores, grades and class position, term by term.
        </p>
      </div>

      {guard ?? (
        <>
          <ChildContextBar
            child={selected.child!}
            childrenLinks={selected.children}
            onSelect={selected.selectChild}
            student={student}
            trailing={
              term.label && <TermBadge label={term.label} isCurrent={term.isViewingCurrentTerm} />
            }
          />

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
              <ResultsBody report={report} termLabel={term.label ?? "This term"} />
            </>
          )}
        </>
      )}
    </div>
  );
}

function ResultsBody({
  report,
  termLabel,
}: {
  report: ReturnType<typeof useReportCard>;
  termLabel: string;
}) {
  if (report.isPaused && !report.data) {
    return <OfflineNotice resourceLabel="This result" />;
  }
  if (report.isPending) {
    return (
      <p className="py-8 text-center text-sm text-n-400" role="status">
        Loading result…
      </p>
    );
  }
  if (report.isError) {
    if (!isPermissionDeniedError(report.error)) {
      return <ErrorState error={report.error} resourceLabel="this result" />;
    }
    return (
      <div className="rounded-xl border border-n-200 bg-white p-8 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-n-100">
          <Hourglass className="size-5 text-n-400" />
        </div>
        <h2 className="mt-4 font-display text-lg font-semibold text-ink">
          {termLabel} isn&rsquo;t published yet
        </h2>
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-n-500">
          Results appear here as soon as the school releases them for the class.
          Nothing is missing on your side.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {report.data.subjects.length > 0 && (
        <div className="rounded-xl border border-n-200 bg-white p-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-n-400">
            Subject scores
          </p>
          <div className="mt-2">
            <SubjectScoresChart subjects={report.data.subjects} />
          </div>
        </div>
      )}
      <div className="rounded-xl border border-n-200 bg-white p-4 sm:p-5">
        <ReportCardBody data={report.data} />
      </div>
    </div>
  );
}
