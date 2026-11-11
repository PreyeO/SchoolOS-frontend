"use client";

import { getErrorMessage } from "@/lib/api/get-error-message";

import { useCardOverview, useCheckedCount } from "../../hooks/use-card-overview";
import { ProgressCard } from "./progress-card";
import { ReadinessList } from "./readiness-list";
import { StudentCardList } from "./student-card-list";

// Progress, readiness and the student list for one session, all from the one
// overview preview. A school whose trial has ended can't run the preview (a
// POST), and the server's own sentence says why, so it's shown as written.
export function CardOverviewSection({ sessionId, onBuy }: { sessionId: string; onBuy: () => void }) {
  const overview = useCardOverview(sessionId);
  const checked = useCheckedCount(sessionId);

  if (overview.isPending) {
    return <p className="text-sm text-n-400" role="status">Working out who has a card…</p>;
  }
  if (overview.isError) {
    return (
      <div className="rounded-2xl border border-n-200 bg-white p-5 text-sm text-ink">
        <p className="font-medium">Couldn&rsquo;t load this session&rsquo;s cards.</p>
        <p className="mt-1 text-n-600">{getErrorMessage(overview.error)}</p>
      </div>
    );
  }
  if (overview.data.total === 0) {
    return (
      <p className="rounded-2xl border border-n-200 bg-white p-5 text-sm text-n-500">
        No students are enrolled in a class for this session yet, so there&rsquo;s nobody to give a card to.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      <ProgressCard overview={overview.data} checked={checked.data} sessionId={sessionId} />
      <ReadinessList overview={overview.data} onBuy={onBuy} />
      <StudentCardList key={sessionId} overview={overview.data} sessionId={sessionId} />
    </div>
  );
}
