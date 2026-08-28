"use client";

import { ErrorState } from "@/components/shared/error-state";
import { OfflineNotice } from "@/components/shared/offline-notice";
import { TermPicker } from "@/components/shared/term-picker";
import { FeeProgress } from "@/features/academic-record/components/fee-progress";
import { LedgerPanel } from "@/features/fees/components/ledger-panel";
import { useStudentLedger } from "@/features/fees/hooks/use-student-ledger";
import { useMe } from "@/features/me/hooks/use-me";
import { NoTermsNotice } from "@/features/results/components/no-terms-notice";
import { TermBadge } from "@/features/results/components/term-badge";
import { useTermSelection } from "@/lib/school/use-term-selection";

import { useMyStudentId } from "../hooks/use-my-student-id";
import { studentScreenGuard } from "./student-screen-guard";

// See child-fees-page: waivers are an admin action, so there are never ids to
// supply. Module-level for a stable reference across renders.
const NO_WAIVERS = new Map<string, string>();

// A student's own fee position.
//
// FeesService._assert_ledger_visible admits the student themself (is_self), and
// unlike results there's no publish gate — balances are recomputed per request,
// so this is always current and a failure really is a failure. Verified live:
// GET /students/<self>/fees/ returns 200 for a student token.
export function MyFeesPage() {
  const term = useTermSelection();
  const { data: me } = useMe();
  const { studentId, isPending } = useMyStudentId();
  const ledger = useStudentLedger(studentId ?? null, term.periodId);

  const guard = studentScreenGuard(studentId, isPending || term.isPending);
  const myName = me ? `${me.user.first_name} ${me.user.last_name}` : "";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">My fees</h1>
          <p className="mt-1 text-sm text-n-500">
            What you were billed this term, and what&rsquo;s left to pay.
          </p>
        </div>
        {term.label && <TermBadge label={term.label} isCurrent={term.isViewingCurrentTerm} />}
      </div>

      {guard ?? (
        <>
          {term.isPaused && !term.hasTerms ? (
            <OfflineNotice resourceLabel="Fees" />
          ) : !term.hasTerms ? (
            <NoTermsNotice consequence="there are no fees to show yet" />
          ) : (
            <>
              <TermPicker
                groups={term.groups}
                value={term.periodId}
                onChange={term.setPeriodId}
                label="Term"
              />

              {ledger.isPaused && !ledger.data ? (
                <OfflineNotice resourceLabel="Your fees" />
              ) : ledger.isPending ? (
                <p className="text-sm text-n-400" role="status">
                  Loading fees…
                </p>
              ) : ledger.isError ? (
                <ErrorState error={ledger.error} resourceLabel="your fees" />
              ) : (
                <div className="space-y-4">
                  <FeeProgress ledger={ledger.data} />
                  <LedgerPanel
                    ledger={ledger.data}
                    termName={term.label ?? ""}
                    studentName={myName}
                    waiverIds={NO_WAIVERS}
                    canRecord={false}
                    canWaive={false}
                    canViewFees={false}
                  />
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
