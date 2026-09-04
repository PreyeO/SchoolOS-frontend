"use client";

import { useMemo } from "react";

import { useClassArmResults } from "./use-report-card";
import { useReviewQueue } from "./use-review-queue";
import { useScoreSheets } from "./use-score-sheets";

// Where the term's results have got to, for the two home screens.
//
// Two requests, both already used elsewhere: the broadsheet lock states and
// every subject's review status. Deliberately not per-student — an average or a
// grade spread only exists after a class is published, which is the *end* of
// this process. What both an admin and a teacher want to know all term is what
// is still outstanding and whose turn it is.
export function useResultsProgress() {
  const { currentTerm } = useScoreSheets();
  const { data: batches, isPending: batchesLoading } = useClassArmResults(currentTerm?.id);
  const { data: queue, isPending: queueLoading } = useReviewQueue(currentTerm?.id);

  return useMemo(() => {
    const submissions = queue ?? [];
    const byStatus = (status: string) => submissions.filter((s) => s.status === status).length;

    // Arms that have ever been locked. An arm with no ClassArmResult row simply
    // hasn't been published, which is the same thing as is_locked false — so
    // absence and false are counted together rather than distinguished.
    const published = (batches ?? []).filter((b) => b.is_locked).length;

    return {
      currentTerm,
      isPending: !!currentTerm && (batchesLoading || queueLoading),
      published,
      // How many arms have a broadsheet row at all. The caller supplies the
      // school's real arm count where it has one — this is only the lower bound.
      startedArms: (batches ?? []).length,
      awaitingReview: byStatus("submitted"),
      sentBack: byStatus("rejected"),
      notSubmitted: byStatus("draft"),
      approved: byStatus("approved"),
      submissions,
    };
  }, [batches, queue, currentTerm, batchesLoading, queueLoading]);
}
