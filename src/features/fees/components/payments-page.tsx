"use client";

import { useMemo, useState } from "react";

import { OfflineNotice } from "@/components/shared/offline-notice";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAcademicSessions } from "@/features/settings/hooks/use-academic-sessions";
import { useHasSchoolPermission } from "@/lib/auth/use-school-permission";
import { buildPeriodOptions, currentPeriodId, periodLabel } from "@/lib/school/period-options";

import { ArrearsTab } from "./arrears-tab";
import { PaymentLogTab } from "./payment-log-tab";

// Money in, and money still out.
//
// Both halves need view_fees, so the whole screen is gated on it up front rather
// than letting two tabs 403 separately — an admin without it would otherwise see
// a working set of pickers above a permission error.
export function PaymentsPage() {
  const { data: sessions, isPending: sessionsLoading, isPaused: sessionsPaused } = useAcademicSessions();
  const canViewFees = useHasSchoolPermission("view_fees");
  const [periodId, setPeriodId] = useState<string | null>(null);

  const termGroups = useMemo(() => buildPeriodOptions(sessions ?? []), [sessions]);
  const selectedPeriod =
    periodId ?? currentPeriodId(sessions ?? []) ?? termGroups[0]?.options[0]?.periodId ?? null;
  const termName = periodLabel(sessions ?? [], selectedPeriod) ?? "this term";

  if (sessionsPaused && !sessions) {
    return <OfflineNotice resourceLabel="Payment records" />;
  }
  if (sessionsLoading) {
    return <p className="text-sm text-n-400" role="status">Loading terms…</p>;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Payments</h1>
        <p className="mt-1 text-sm text-n-500">
          Every payment the school has taken, and who still owes for the term.
        </p>
      </div>

      {!canViewFees ? (
        <p className="text-sm text-clay" role="alert">
          You don&rsquo;t have permission to view payments.
        </p>
      ) : termGroups.length === 0 ? (
        <p className="rounded-lg border border-amber/40 bg-amber/10 px-3.5 py-2.5 text-sm text-ink">
          Fees are charged per term, and this school has no terms yet.
        </p>
      ) : (
        <Tabs defaultValue="arrears">
          <TabsList>
            <TabsTrigger value="arrears">Who owes</TabsTrigger>
            <TabsTrigger value="log">Payment log</TabsTrigger>
          </TabsList>

          <TabsContent value="arrears">
            <ArrearsTab
              termGroups={termGroups}
              periodId={selectedPeriod}
              onPeriodChange={setPeriodId}
              termName={termName}
            />
          </TabsContent>

          <TabsContent value="log">
            <PaymentLogTab />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
