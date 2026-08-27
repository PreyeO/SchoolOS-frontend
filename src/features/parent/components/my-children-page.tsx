"use client";

import { Users2 } from "lucide-react";

import { ErrorState } from "@/components/shared/error-state";
import { OfflineNotice } from "@/components/shared/offline-notice";
import { TermBadge } from "@/features/results/components/term-badge";
import { NoTermsNotice } from "@/features/results/components/no-terms-notice";
import { TermPicker } from "@/components/shared/term-picker";
import { useTermSelection } from "@/lib/school/use-term-selection";

import { useChildrenOverview } from "../hooks/use-children-overview";
import { ChildCard } from "./child-card";
import { ChildCardSkeleton } from "./child-card-skeleton";

// Every child at once, for a term of the parent's choosing.
//
// The term picker is what distinguishes this from the home screen's snapshot,
// which is fixed to the current term — comparing last term across two children
// is exactly the thing that needs a full screen rather than a dashboard card.
export function MyChildrenPage() {
  const term = useTermSelection();
  const { overviews, isPending, unavailableOffline, isError, error } = useChildrenOverview(
    term.periodId,
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">My Children</h1>
          <p className="mt-1 text-sm text-n-500">
            Open a child for their full result and fee breakdown.
          </p>
        </div>
        {term.label && <TermBadge label={term.label} isCurrent={term.isViewingCurrentTerm} />}
      </div>

      {term.isPaused && !term.hasTerms ? (
        <OfflineNotice resourceLabel="Your children" />
      ) : !term.hasTerms ? (
        <NoTermsNotice consequence="there are no results or fees to show yet" />
      ) : (
        <>
          <TermPicker
            groups={term.groups}
            value={term.periodId}
            onChange={term.setPeriodId}
            label="Term"
          />

          {unavailableOffline ? (
            <OfflineNotice resourceLabel="Your children" />
          ) : isError ? (
            <ErrorState error={error} resourceLabel="your children" />
          ) : isPending ? (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <ChildCardSkeleton />
              <ChildCardSkeleton />
            </ul>
          ) : overviews.length === 0 ? (
            <div className="rounded-xl border border-n-200 bg-white p-8 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-n-100">
                <Users2 className="size-5 text-n-400" />
              </div>
              <h2 className="mt-4 font-display text-lg font-semibold text-ink">
                No children linked yet
              </h2>
              <p className="mx-auto mt-1.5 max-w-sm text-sm text-n-500">
                Ask the school office to link your account to your child&rsquo;s record.
              </p>
            </div>
          ) : (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {overviews.map((overview) => (
                <ChildCard key={overview.link.id} overview={overview} />
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
