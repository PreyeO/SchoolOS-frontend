"use client";

import { ErrorState } from "@/components/shared/error-state";
import { OfflineNotice } from "@/components/shared/offline-notice";
import { LedgerPanel } from "@/features/fees/components/ledger-panel";
import { useStudentLedger } from "@/features/fees/hooks/use-student-ledger";

interface Props {
  studentId: string;
  studentName: string;
  periodId: string | null;
  termLabel: string;
}

// Module-level so the reference is stable across renders — LedgerTable reads
// this map per row, and a fresh Map each render would defeat any memoisation
// downstream. Waivers are an admin action, so a parent never has ids to supply.
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
export function ChildFeesTab({ studentId, studentName, periodId, termLabel }: Props) {
  const ledger = useStudentLedger(studentId, periodId);

  if (ledger.isPaused && !ledger.data) {
    return <OfflineNotice resourceLabel="These fees" />;
  }

  if (ledger.isPending) {
    return <p className="text-sm text-n-400" role="status">Loading fees…</p>;
  }

  if (ledger.isError) {
    return <ErrorState error={ledger.error} resourceLabel="these fees" />;
  }

  return (
    <LedgerPanel
      ledger={ledger.data}
      termName={termLabel}
      studentName={studentName}
      waiverIds={NO_WAIVERS}
      canRecord={false}
      canWaive={false}
      canViewFees={false}
    />
  );
}
