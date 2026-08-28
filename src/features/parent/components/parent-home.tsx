"use client";

import { RecentNotices } from "@/features/communication/components/recent-notices";
import { useStudentLedger } from "@/features/fees/hooks/use-student-ledger";
import { useMe } from "@/features/me/hooks/use-me";
import { TermBadge } from "@/features/results/components/term-badge";
import { useReportCard } from "@/features/results/hooks/use-report-card";
import { isPermissionDeniedError } from "@/lib/api/get-error-message";
import { useTermSelection } from "@/lib/school/use-term-selection";
import { useSchoolStore } from "@/stores/school-store";

import { usePerformanceTrend } from "@/features/academic-record/hooks/use-performance-trend";
import { useChildStudent } from "../hooks/use-child-student";
import { useSelectedChild } from "../hooks/use-selected-child";
import { ChildContextBar } from "./child-context-bar";
import { RecordSnapshot } from "@/features/academic-record/components/record-snapshot";
import { childScreenGuard } from "./child-screen-guard";
import { FeeProgress } from "@/features/academic-record/components/fee-progress";
import { PerformanceCard } from "@/features/academic-record/components/performance-card";
import { SubjectPerformanceCard } from "@/features/academic-record/components/subject-performance-card";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// A parent's landing screen, scoped to whichever child the switcher has
// selected: this term's standing, how the year is trending, what's owed, and
// what the school has said lately.
//
// Fixed to the current term with no picker — the trend chart supplies the
// history, and a picker on a summary screen would compete with it. Looking a
// past term up in detail is what /child/results and /child/fees are for. Same
// split as the teacher home against My Classes.
export function ParentHome() {
  const { data: me } = useMe();
  const school = useSchoolStore((s) => s.currentSchool);
  const term = useTermSelection();
  const selected = useSelectedChild();

  const childId = selected.child?.student_id;
  const { student } = useChildStudent(childId, term.periodId);
  const ledger = useStudentLedger(childId ?? null, term.periodId);
  const reportCard = useReportCard(childId, term.periodId);
  const performance = usePerformanceTrend(childId, term.periodId);

  const guard = childScreenGuard(selected);

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-2">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">
          {greeting()}
          {me?.user.first_name ? `, ${me.user.first_name}` : ""}
        </h1>
        <p className="mt-1 text-sm text-n-500">{school?.name ?? me?.school.name}</p>
      </div>

      {guard ?? (
        <>
          <ChildContextBar
            child={selected.child!}
            childrenLinks={selected.children}
            onSelect={selected.selectChild}
            student={student}
            trailing={
              term.label && (
                <TermBadge label={term.label} isCurrent={term.isViewingCurrentTerm} />
              )
            }
          />

          <RecordSnapshot
            ledger={ledger.data}
            reportCard={reportCard.data}
            awaitingResults={isPermissionDeniedError(reportCard.error)}
          />

          <PerformanceCard
            points={performance.points}
            sessionName={performance.sessionName}
            termCount={performance.termCount}
            isPending={performance.isPending}
          />

          <SubjectPerformanceCard
            reportCard={reportCard.data}
            awaitingResults={isPermissionDeniedError(reportCard.error)}
            isPending={reportCard.isPending}
            termLabel={term.label ?? "This term"}
            href="/child/results"
          />

          {ledger.data && <FeeProgress ledger={ledger.data} />}

          <RecentNotices />
        </>
      )}
    </div>
  );
}
