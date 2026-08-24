"use client";

import { OfflineNotice } from "@/components/shared/offline-notice";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHasSchoolPermission } from "@/lib/auth/use-school-permission";
import { useTermSelection } from "@/lib/school/use-term-selection";

import { ArrearsTab } from "./arrears-tab";
import { PaymentLogTab } from "./payment-log-tab";

// Money in, and money still out.
//
// Both halves need view_fees, so the whole screen is gated on it up front rather
// than letting two tabs 403 separately — an admin without it would otherwise see
// a working set of pickers above a permission error.
export function PaymentsPage() {
  const term = useTermSelection();
  const canViewFees = useHasSchoolPermission("view_fees");

  const termName = term.label ?? "this term";

  if (term.isPaused && !term.hasTerms) {
    return <OfflineNotice resourceLabel="Payment records" />;
  }
  if (term.isPending) {
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
      ) : !term.hasTerms ? (
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
              termGroups={term.groups}
              periodId={term.periodId}
              onPeriodChange={term.setPeriodId}
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
