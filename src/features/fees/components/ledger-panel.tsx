"use client";

import { SectionLabel } from "@/components/ui/SectionLabel";
import type { UseQueryResult } from "@tanstack/react-query";

import type { Payment, StudentLedger } from "../types";
import { LedgerSummary } from "./ledger-summary";
import { LedgerTable } from "./ledger-table";
import { NotBilledNotice } from "./not-billed-notice";
import { PaymentHistory } from "./payment-history";

interface Props {
  ledger: StudentLedger;
  termName: string;
  studentName: string;
  waiverIds: Map<string, string>;
  canRecord: boolean;
  canWaive: boolean;
  canViewFees: boolean;
  payments: UseQueryResult<Payment[]>;
}

// The loaded half of the bursar's desk — summary, the line-by-line table (or
// why there isn't one), and payment history. Split out of StudentFeesPage once
// the deep-link handling pushed it past the 150-line limit; this is the part
// that only exists once a ledger has actually resolved.
export function LedgerPanel({
  ledger,
  termName,
  studentName,
  waiverIds,
  canRecord,
  canWaive,
  canViewFees,
  payments,
}: Props) {
  return (
    <div className="space-y-5">
      <LedgerSummary
        student={ledger.student}
        termLabel={termName}
        totalBalance={ledger.total_balance}
        isBilled={ledger.is_billed}
      />

      {!ledger.is_billed ? (
        <NotBilledNotice studentName={studentName} termLabel={termName} />
      ) : ledger.items.length === 0 ? (
        <p className="text-sm text-n-400 italic">
          This student&rsquo;s class has no fees set for {termName}.
        </p>
      ) : (
        <LedgerTable
          ledger={ledger}
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
  );
}
