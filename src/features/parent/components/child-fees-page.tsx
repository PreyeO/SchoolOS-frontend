"use client";

import { ErrorState } from "@/components/shared/error-state";
import { OfflineNotice } from "@/components/shared/offline-notice";
import { TermPicker } from "@/components/shared/term-picker";
import { LedgerPanel } from "@/features/fees/components/ledger-panel";
import { useStudentLedger } from "@/features/fees/hooks/use-student-ledger";
import { NoTermsNotice } from "@/features/results/components/no-terms-notice";
import { TermBadge } from "@/features/results/components/term-badge";
import { useTermSelection } from "@/lib/school/use-term-selection";

import { useChildStudent } from "../hooks/use-child-student";
import { useSelectedChild } from "../hooks/use-selected-child";
import { ChildContextBar } from "./child-context-bar";
import { childScreenGuard } from "./child-screen-guard";
import { FeeProgress } from "./fee-progress";

// Module-level so the reference is stable across renders. Waivers are an admin
// action, so a parent never has ids to supply.
const NO_WAIVERS = new Map<string, string>();

// The same ledger the bursar sees, minus every action.
//
// FeesService._assert_ledger_visible admits a linked parent outright (live
// ParentStudentLink check per request), and unlike results there's no lock or
// publish step — balances are computed per request, so what's here is what's
// owed right now. A plain ErrorState is therefore right: a failure here really
// is a failure, not a "not released yet".
//
// The capability flags are passed false rather than read from
// useHasSchoolPermission: that hook resolves off me.admin.school_admin_role,
// which a parent has no block for, so it would return false anyway — but by
// accident rather than by statement. LedgerPanel drops the payment history
// section and every row action under these, so no payments query is needed.
export function ChildFeesPage() {
  const term = useTermSelection();
  const selected = useSelectedChild();
  const childId = selected.child?.student_id;
  const { student } = useChildStudent(childId, term.periodId);
  const ledger = useStudentLedger(childId ?? null, term.periodId);

  const guard = childScreenGuard(selected);
  const termName = term.label ?? "";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Fees</h1>
        <p className="mt-1 text-sm text-n-500">
          What your child was billed this term, and what&rsquo;s left to pay.
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
                <OfflineNotice resourceLabel="These fees" />
              ) : ledger.isPending ? (
                <p className="text-sm text-n-400" role="status">
                  Loading fees…
                </p>
              ) : ledger.isError ? (
                <ErrorState error={ledger.error} resourceLabel="these fees" />
              ) : (
                <div className="space-y-4">
                  <FeeProgress ledger={ledger.data} />
                  <LedgerPanel
                    ledger={ledger.data}
                    termName={termName}
                    studentName={selected.child!.student_name}
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
