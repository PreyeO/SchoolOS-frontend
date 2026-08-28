"use client";

import { OfflineNotice } from "@/components/shared/offline-notice";
import { TermPicker } from "@/components/shared/term-picker";
import { AttendanceRecordView } from "@/features/academic-record/components/attendance-record-view";
import { useTermDates } from "@/features/academic-record/hooks/use-term-dates";
import { NoTermsNotice } from "@/features/results/components/no-terms-notice";
import { TermBadge } from "@/features/results/components/term-badge";
import { useTermSelection } from "@/lib/school/use-term-selection";

import { useMyStudentId } from "../hooks/use-my-student-id";
import { studentScreenGuard } from "./student-screen-guard";

// A student's own attendance. Same backend change as the parent's — the
// queryset now self-scopes for a student — and the same shared view.
export function MyAttendancePage() {
  const term = useTermSelection();
  const { studentId, isPending } = useMyStudentId();
  const range = useTermDates(term.periodId);

  const guard = studentScreenGuard(studentId, isPending || term.isPending);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">My attendance</h1>
          <p className="mt-1 text-sm text-n-500">Every day marked for you this term.</p>
        </div>
        {term.label && <TermBadge label={term.label} isCurrent={term.isViewingCurrentTerm} />}
      </div>

      {guard ?? (
        <>
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
              <AttendanceRecordView studentId={studentId} range={range} subject="you" />
            </>
          )}
        </>
      )}
    </div>
  );
}
