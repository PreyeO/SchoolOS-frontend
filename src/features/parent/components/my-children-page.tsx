"use client";

import { Users2 } from "lucide-react";

import { ErrorState } from "@/components/shared/error-state";
import { OfflineNotice } from "@/components/shared/offline-notice";
import { useMe } from "@/features/me/hooks/use-me";

import { ChildCard } from "./child-card";

export function MyChildrenPage() {
  const { data: me, isPending, isPaused, isError, error } = useMe();
  const children = me?.parent?.student_links ?? [];

  // isPaused && !me, not isPending && isPaused — a disabled query is pending
  // with fetchStatus "idle", so the conjunction never fires. Same shape as
  // use-my-classes.ts and every other offline gate here.
  if (isPaused && !me) {
    return <OfflineNotice resourceLabel="Your children" />;
  }

  if (isPending) {
    return <p className="text-sm text-n-400" role="status">Loading…</p>;
  }

  if (isError) {
    return <ErrorState error={error} resourceLabel="your children" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">My Children</h1>
        <p className="mt-1 text-sm text-n-500">
          Open a child to see their results and what they owe for the term.
        </p>
      </div>

      {children.length === 0 ? (
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
          {children.map((child) => (
            <ChildCard key={child.id} child={child} />
          ))}
        </ul>
      )}
    </div>
  );
}
