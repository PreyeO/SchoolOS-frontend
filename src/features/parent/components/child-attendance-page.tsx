"use client";

import { OfflineNotice } from "@/components/shared/offline-notice";
import { TermPicker } from "@/components/shared/term-picker";
import { AttendanceRecordView } from "@/features/academic-record/components/attendance-record-view";
import { useTermDates } from "@/features/academic-record/hooks/use-term-dates";
import { NoTermsNotice } from "@/features/results/components/no-terms-notice";
import { TermBadge } from "@/features/results/components/term-badge";
import { useTermSelection } from "@/lib/school/use-term-selection";

import { useChildStudent } from "../hooks/use-child-student";
import { useSelectedChild } from "../hooks/use-selected-child";
import { ChildContextBar } from "./child-context-bar";
import { childScreenGuard } from "./child-screen-guard";

// Was a "Soon" placeholder until 2026-08-29, when the backend gave parents a
// scoped view of their children's attendance. AttendanceRecordViewSet now
// filters to linked children for a parent, so ?student= is all this needs —
// there's no client-side identity check, same as the fee ledger.
export function ChildAttendancePage() {
  const term = useTermSelection();
  const selected = useSelectedChild();
  const childId = selected.child?.student_id;
  const { student } = useChildStudent(childId, term.periodId);
  const range = useTermDates(term.periodId);

  const guard = childScreenGuard(selected);
  const firstName = selected.child?.student_name.split(" ")[0] ?? "your child";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Attendance</h1>
        <p className="mt-1 text-sm text-n-500">
          Every day marked for your child this term.
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
            <OfflineNotice resourceLabel="Attendance" />
          ) : !term.hasTerms ? (
            <NoTermsNotice consequence="there is no attendance to show yet" />
          ) : (
            <>
              <TermPicker
                groups={term.groups}
                value={term.periodId}
                onChange={term.setPeriodId}
                label="Term"
              />
              <AttendanceRecordView studentId={childId} range={range} subject={firstName} />
            </>
          )}
        </>
      )}
    </div>
  );
}
