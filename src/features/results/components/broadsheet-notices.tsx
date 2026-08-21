"use client";

import Link from "next/link";
import { Lock, TriangleAlert } from "lucide-react";

import { useCanAccess } from "@/lib/auth/use-can-access";

interface Props {
  isLocked: boolean;
  missingScores: number;
  emptyColumns: number;
}

// What the grid can't say for itself: why the right-hand columns are blank, and
// what's still outstanding. Both are the reason an admin opens this screen
// before publishing rather than after.
export function BroadsheetNotices({ isLocked, missingScores, emptyColumns }: Props) {
  // This screen is staff-wide but Publish Results is admin-only, so the link
  // only appears for someone it would actually open for.
  const canPublish = useCanAccess("/results/publish");
  const hasGaps = missingScores > 0 || emptyColumns > 0;

  return (
    <>
      {/* Positions and averages don't exist before the lock — they're computed
          at lock time, not derived here. Saying so beats a column of dashes the
          reader has to interpret. */}
      {!isLocked && (
        <p className="flex items-start gap-2 rounded-lg border border-n-200 bg-n-50 px-3.5 py-2.5 text-xs text-n-600">
          <Lock className="mt-0.5 size-3.5 shrink-0 text-n-400" />
          <span>
            Not published yet, so totals, averages and positions are blank — they&rsquo;re
            computed when the class is published
            {canPublish ? (
              <>
                {" "}
                in{" "}
                <Link href="/results/publish" className="text-primary hover:underline">
                  Publish Results
                </Link>
              </>
            ) : null}
            . Subject scores below are current.
          </span>
        </p>
      )}

      {hasGaps && (
        <p className="flex items-start gap-2 rounded-lg border border-amber/40 bg-amber/10 px-3.5 py-2.5 text-xs text-ink">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-amber" />
          <span>
            {missingScores > 0 && (
              <>
                {missingScores} student{missingScores === 1 ? " has" : "s have"} no scores in any
                subject.
              </>
            )}
            {missingScores > 0 && emptyColumns > 0 && " "}
            {emptyColumns > 0 && (
              <>
                {emptyColumns} subject{emptyColumns === 1 ? " has" : "s have"} no scores from
                anyone.
              </>
            )}
          </span>
        </p>
      )}
    </>
  );
}
