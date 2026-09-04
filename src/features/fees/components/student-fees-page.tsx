"use client";

import { useMemo } from "react";

import { ErrorState } from "@/components/shared/error-state";
import { OfflineNotice } from "@/components/shared/offline-notice";
import { useHasSchoolPermission } from "@/lib/auth/use-school-permission";
import { useTermSelection } from "@/lib/school/use-term-selection";

import {
  useStudentLedger,
  useStudentPayments,
  useStudentWaivers,
} from "../hooks/use-student-ledger";
import { useStudentFeesSelection } from "../hooks/use-student-fees-selection";
import { LedgerPanel } from "./ledger-panel";
import { StudentFeesContextBar } from "./student-fees-context-bar";

// The bursar's desk: one student, one term, what they owe, and taking money.
//
// Balances are live — computed per request from the student's current class, not
// snapshotted — so there is no lock or publish step here, unlike results. What's
// on screen is what's owed right now.
//
// initialStudentId/initialPeriodId arrive from ?student=&period= — set by the
// Payments arrears list's "click a name" link (see arrears-table.tsx). The URL
// is then kept in sync with whoever is actually selected (mirrors
// attendance-page.tsx's own arm/date sync), so a refresh lands back on the
// same student rather than snapping to a blank search box.
export function StudentFeesPage({
  initialStudentId,
  initialPeriodId,
}: {
  initialStudentId?: string;
  initialPeriodId?: string;
}) {
  const term = useTermSelection();
  // view_fees is strictly more than the ledger needs: a teacher can read a
  // ledger but 403s on the payment and waiver lists, so those are gated here
  // rather than allowed to fail.
  const canViewFees = useHasSchoolPermission("view_fees");
  const canRecord = useHasSchoolPermission("record_fees");
  const canWaive = useHasSchoolPermission("edit_fees");

  const { student, setStudent, isResolvingStudent } = useStudentFeesSelection(
    initialStudentId,
    initialPeriodId,
    term,
  );

  const ledger = useStudentLedger(student?.id ?? null, term.periodId);
  const payments = useStudentPayments(student?.id ?? null, canViewFees);
  const waivers = useStudentWaivers(student?.id ?? null, canViewFees && canWaive);

  // fee_item id → waiver id. The ledger says *whether* a row is waived but not
  // which waiver record to delete, so un-waiving needs this lookup.
  const waiverIds = useMemo(
    () => new Map((waivers.data ?? []).map((w) => [w.fee_item, w.id])),
    [waivers.data],
  );

  const termName = term.label ?? "";
  const studentName = student ? `${student.user.first_name} ${student.user.last_name}` : "";

  if (term.isPaused && !term.hasTerms) {
    return <OfflineNotice resourceLabel="Fee records" />;
  }
  if (term.isPending) {
    return (
      <p className="text-sm text-n-400" role="status">
        Loading terms…
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Fees &amp; Invoices</h1>
        <p className="mt-1 text-sm text-n-500">
          Look up what a student owes this term, take a payment, and print the receipt.
        </p>
      </div>

      {!term.hasTerms ? (
        <p className="rounded-lg border border-amber/40 bg-amber/10 px-3.5 py-2.5 text-sm text-ink">
          Fees are charged per term, and this school has no terms yet.
        </p>
      ) : (
        <>
          <StudentFeesContextBar
            student={student}
            isResolvingStudent={isResolvingStudent}
            onStudentChange={setStudent}
            termGroups={term.groups}
            periodId={term.periodId}
            onPeriodChange={term.setPeriodId}
          />

          {isResolvingStudent ? (
            // The deep-linked id has arrived but useStudentDetail hasn't
            // resolved it into a full record yet — student is still null at
            // this point. Without this branch, that window showed "Search for
            // a student" underneath the context bar's own "Loading student…",
            // which read as the link having silently failed rather than
            // still being in flight.
            <p className="text-sm text-n-400" role="status">
              Loading fees…
            </p>
          ) : !student ? (
            <p className="text-sm text-n-400 italic">
              Search for a student to see their fees for {termName}.
            </p>
          ) : ledger.isPaused && !ledger.data ? (
            <OfflineNotice resourceLabel="This student's fees" />
          ) : ledger.isPending ? (
            <p className="text-sm text-n-400" role="status">
              Loading fees…
            </p>
          ) : ledger.isError ? (
            <ErrorState error={ledger.error} resourceLabel="this student's fees" />
          ) : (
            <LedgerPanel
              ledger={ledger.data}
              termName={termName}
              studentName={studentName}
              waiverIds={waiverIds}
              canRecord={canRecord}
              canWaive={canWaive}
              canViewFees={canViewFees}
              payments={payments}
            />
          )}
        </>
      )}
    </div>
  );
}
