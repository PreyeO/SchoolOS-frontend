"use client";

import { useMemo, useState } from "react";

import { ErrorState } from "@/components/shared/error-state";
import { OfflineNotice } from "@/components/shared/offline-notice";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { StudentListItem } from "@/features/students/types";
import { useHasSchoolPermission } from "@/lib/auth/use-school-permission";
import { useTermSelection } from "@/lib/school/use-term-selection";

import {
  useStudentLedger,
  useStudentPayments,
  useStudentWaivers,
} from "../hooks/use-student-ledger";
import { LedgerSummary } from "./ledger-summary";
import { LedgerTable } from "./ledger-table";
import { NotBilledNotice } from "./not-billed-notice";
import { PaymentHistory } from "./payment-history";
import { StudentFeesContextBar } from "./student-fees-context-bar";

// The bursar's desk: one student, one term, what they owe, and taking money.
//
// Balances are live — computed per request from the student's current class, not
// snapshotted — so there is no lock or publish step here, unlike results. What's
// on screen is what's owed right now.
export function StudentFeesPage() {
  const term = useTermSelection();
  // view_fees is strictly more than the ledger needs: a teacher can read a
  // ledger but 403s on the payment and waiver lists, so those are gated here
  // rather than allowed to fail.
  const canViewFees = useHasSchoolPermission("view_fees");
  const canRecord = useHasSchoolPermission("record_fees");
  const canWaive = useHasSchoolPermission("edit_fees");

  const [student, setStudent] = useState<StudentListItem | null>(null);

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
            onStudentChange={setStudent}
            termGroups={term.groups}
            periodId={term.periodId}
            onPeriodChange={term.setPeriodId}
          />

          {!student ? (
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
            <div className="space-y-5">
              <LedgerSummary
                student={ledger.data.student}
                termLabel={termName}
                totalBalance={ledger.data.total_balance}
                isBilled={ledger.data.is_billed}
              />

              {!ledger.data.is_billed ? (
                <NotBilledNotice studentName={studentName} termLabel={termName} />
              ) : ledger.data.items.length === 0 ? (
                <p className="text-sm text-n-400 italic">
                  This student&rsquo;s class has no fees set for {termName}.
                </p>
              ) : (
                <LedgerTable
                  ledger={ledger.data}
                  studentName={studentName}
                  waiverIds={waiverIds}
                  canRecord={canRecord}
                  canWaive={canWaive}
                />
              )}

              {canViewFees && (
                <section className="space-y-2.5">
                  <SectionLabel>Payment history</SectionLabel>
                  <PaymentHistory
                    payments={payments.data}
                    isPending={payments.isPending}
                    isError={payments.isError}
                    error={payments.error}
                  />
                </section>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
