"use client";

import { School } from "lucide-react";

import { RecentNotices } from "@/features/communication/components/recent-notices";
import { FeeProgress } from "@/features/academic-record/components/fee-progress";
import { PerformanceCard } from "@/features/academic-record/components/performance-card";
import { RecordSnapshot } from "@/features/academic-record/components/record-snapshot";
import { SubjectPerformanceCard } from "@/features/academic-record/components/subject-performance-card";
import { usePerformanceTrend } from "@/features/academic-record/hooks/use-performance-trend";
import { useStudentLedger } from "@/features/fees/hooks/use-student-ledger";
import { useMe } from "@/features/me/hooks/use-me";
import { TermBadge } from "@/features/results/components/term-badge";
import { useReportCard } from "@/features/results/hooks/use-report-card";
import { isPermissionDeniedError } from "@/lib/api/get-error-message";
import { armDisplayName } from "@/lib/school/arm-display-name";
import { useTermSelection } from "@/lib/school/use-term-selection";
import { greeting } from "@/lib/text/greeting";
import { useSchoolStore } from "@/stores/school-store";

import { useMyStudentId } from "../hooks/use-my-student-id";
import { NotEnrolledNotice } from "./not-enrolled-notice";

// A student's own landing screen — the same shape as a parent's, minus the
// child switcher, because a student is only ever looking at themselves.
//
// Fixed to the current term: the trend card carries the history, and picking a
// past term is what /my/results and /my/fees are for.
export function StudentHome() {
  const { data: me } = useMe();
  const school = useSchoolStore((s) => s.currentSchool);
  const term = useTermSelection();
  const { studentId, isPending: idPending } = useMyStudentId();

  const ledger = useStudentLedger(studentId ?? null, term.periodId);
  const reportCard = useReportCard(studentId, term.periodId);
  const performance = usePerformanceTrend(studentId, term.periodId);

  const currentClass = me?.student?.current_class ?? null;

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            {greeting()}
            {me?.user.first_name ? `, ${me.user.first_name}` : ""}
          </h1>
          <p className="mt-1 text-sm text-n-500">{school?.name ?? me?.school.name}</p>
        </div>
        {term.label && <TermBadge label={term.label} isCurrent={term.isViewingCurrentTerm} />}
      </div>

      <div className="flex items-center gap-4 rounded-xl border border-n-200 bg-white p-5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <School className="size-5 text-primary" />
        </span>
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-n-400">Your class</p>
          {currentClass ? (
            <p className="mt-0.5 text-lg font-semibold text-ink">
              {armDisplayName(
                { name: currentClass.arm_name, is_default: currentClass.is_default },
                currentClass.class_name,
              )}
              <span className="ml-2 text-sm font-normal text-n-400">{currentClass.session}</span>
            </p>
          ) : (
            <p className="mt-0.5 text-sm text-n-400" role="status">
              {idPending ? "Loading…" : "Not placed in a class yet"}
            </p>
          )}
        </div>
      </div>

      {/* Everything below needs the student's own profile id, which is derived
          from their class roster — so with no enrolment there is nothing to
          fetch, and saying so beats four empty cards. */}
      {!studentId ? (
        !idPending && <NotEnrolledNotice />
      ) : (
        <>
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
            href="/my/results"
          />

          {ledger.data && <FeeProgress ledger={ledger.data} />}
        </>
      )}

      <RecentNotices />
    </div>
  );
}
