"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, TriangleAlert } from "lucide-react";

import { useResultsProgress } from "@/features/results/hooks/use-results-progress";
import { useScoreSheets } from "@/features/results/hooks/use-score-sheets";
import { cn } from "@/lib/utils";

// The teacher's own score sheets and where each has got to.
//
// The submissions list is school-wide and open to any school member — `list`
// carries no required permission on ClassArmSubjectResultSubmissionViewSet — so
// this is one request, narrowed here to the (arm, subject) pairs this teacher
// actually holds. Their assignment is the authorisation for entering scores, so
// it's also the right filter for what counts as theirs.
export function MyResultsCard() {
  const { sheets, currentTerm } = useScoreSheets();
  const { isPending, submissions } = useResultsProgress();

  const mine = useMemo(() => {
    const keys = new Set(sheets.map((s) => `${s.classArmId}|${s.subjectId}`));
    return submissions.filter((s) => keys.has(`${s.class_arm}|${s.subject}`));
  }, [sheets, submissions]);

  if (!currentTerm || sheets.length === 0) return null;

  const approved = mine.filter((s) => s.status === "approved").length;
  const sentBack = mine.filter((s) => s.status === "rejected").length;
  // Anything with no submission row hasn't been started, so the outstanding
  // count is measured against the teacher's sheets rather than against the rows
  // that happen to exist — a subject nobody has opened yet is the most
  // outstanding of all, and would otherwise be invisible.
  const outstanding = sheets.length - approved - mine.filter((s) => s.status === "submitted").length;
  const awaiting = mine.filter((s) => s.status === "submitted").length;

  return (
    <section className="rounded-xl border border-n-200 bg-white p-5 lg:col-span-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-base font-semibold text-ink">Your results</h2>
        <Link
          href="/results"
          className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          Enter scores <ArrowRight className="size-3" />
        </Link>
      </div>
      <p className="mt-0.5 text-xs text-n-400">{currentTerm.label}</p>

      {isPending ? (
        <p className="mt-4 text-sm text-n-400" role="status">Loading…</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {sentBack > 0 && (
            <li className="flex items-center gap-2.5 rounded-lg border border-clay/30 bg-clay/5 px-3 py-2">
              <TriangleAlert className="size-4 shrink-0 text-clay" />
              <span className="min-w-0 flex-1 text-sm text-ink">
                {sentBack} sent back for correction
              </span>
              <Link href="/results" className="shrink-0 text-xs font-medium text-clay hover:underline">
                Fix
              </Link>
            </li>
          )}

          <li className="flex items-center gap-2.5 py-1">
            <CheckCircle2
              className={cn(
                "size-4 shrink-0",
                approved === sheets.length ? "text-grass" : "text-n-300",
              )}
            />
            <span className="min-w-0 flex-1 text-sm text-n-500">
              {approved} of {sheets.length} subject{sheets.length === 1 ? "" : "s"} approved
            </span>
          </li>

          {awaiting > 0 && (
            <li className="py-1 text-sm text-n-500">
              {awaiting} submitted, waiting on review
            </li>
          )}

          {outstanding > 0 && (
            <li className="py-1 text-sm text-n-500">
              <span className="font-medium text-ink">{outstanding}</span> still to submit
            </li>
          )}
        </ul>
      )}
    </section>
  );
}
