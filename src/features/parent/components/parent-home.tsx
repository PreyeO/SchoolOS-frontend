"use client";

import { Users2 } from "lucide-react";

import { ErrorState } from "@/components/shared/error-state";
import { OfflineNotice } from "@/components/shared/offline-notice";
import { RecentNotices } from "@/features/communication/components/recent-notices";
import { TermBadge } from "@/features/results/components/term-badge";
import { useMe } from "@/features/me/hooks/use-me";
import { useTermSelection } from "@/lib/school/use-term-selection";
import { useSchoolStore } from "@/stores/school-store";

import { useChildrenOverview } from "../hooks/use-children-overview";
import { ChildCard } from "./child-card";
import { ChildCardSkeleton } from "./child-card-skeleton";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// A parent's landing screen: how each child's term is going, what's owed, and
// what the school has said lately.
//
// Fixed to the current term with no picker — this is a snapshot, and the child
// detail page is where a past term gets looked up. That's the same split the
// teacher home uses against My Classes.
export function ParentHome() {
  const { data: me } = useMe();
  const school = useSchoolStore((s) => s.currentSchool);
  const term = useTermSelection();
  const { overviews, isPending, unavailableOffline, isError, error } = useChildrenOverview(
    term.periodId,
  );

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">
            {greeting()}
            {me?.user.first_name ? `, ${me.user.first_name}` : ""}
          </h1>
          <p className="mt-1 text-sm text-n-500">{school?.name ?? me?.school.name}</p>
        </div>
        {term.label && <TermBadge label={term.label} isCurrent={term.isViewingCurrentTerm} />}
      </div>

      <section className="space-y-3">
        <h2 className="font-display text-base font-semibold text-ink">
          {overviews.length === 1 ? "Your child" : "Your children"}
        </h2>

        {unavailableOffline ? (
          <OfflineNotice resourceLabel="Your children" />
        ) : isError ? (
          <ErrorState error={error} resourceLabel="your children" />
        ) : isPending ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            <ChildCardSkeleton />
            <ChildCardSkeleton />
          </ul>
        ) : overviews.length === 0 ? (
          <div className="rounded-xl border border-n-200 bg-white p-6 text-center">
            <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-n-100">
              <Users2 className="size-5 text-n-400" />
            </div>
            <p className="mt-3 text-sm font-medium text-ink">No children linked yet</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-n-500">
              Ask the school office to link your account to your child&rsquo;s record.
            </p>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {overviews.map((overview) => (
              <ChildCard key={overview.link.id} overview={overview} />
            ))}
          </ul>
        )}
      </section>

      <RecentNotices />
    </div>
  );
}
