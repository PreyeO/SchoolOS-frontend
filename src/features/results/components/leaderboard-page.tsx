"use client";

import { useMemo, useState } from "react";

import { ErrorState } from "@/components/shared/error-state";
import { useClasses } from "@/features/settings/hooks/use-classes";
import { useArmSubjects } from "@/features/teaching-assignments/hooks/use-arm-subjects";
import { buildArmOptions } from "@/lib/school/arm-options";
import { useTermSelection } from "@/lib/school/use-term-selection";

import { useOverallLeaderboard, useSubjectLeaderboard } from "../hooks/use-leaderboard";
import { LeaderboardEmpty } from "./leaderboard-empty";
import { LeaderboardFilters, type LeaderboardMode } from "./leaderboard-filters";
import { LeaderboardTable } from "./leaderboard-table";
import { NoTermsNotice } from "./no-terms-notice";
import { TermBadge } from "./term-badge";

// Who's top — overall, or in one subject.
//
// The two modes differ in more than filtering. Overall reads
// StudentResultSummary, which only exists once the broadsheet is locked, so it
// stays empty until results are published. By-subject reads
// StudentSubjectResult, which exists as soon as scores are entered — so it
// works all term, and is the one a teacher can use before publishing.
export function LeaderboardPage() {
  // Both leaderboards take a period, so both follow the picker. Ranking a past
  // term is the normal way to answer "who topped the class last term".
  const term = useTermSelection();
  const { data: classes, isPending: classesLoading, isError, error } = useClasses();
  const [mode, setMode] = useState<LeaderboardMode>("overall");
  const [armId, setArmId] = useState<string | null>(null);
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [acrossClass, setAcrossClass] = useState(false);

  const groups = useMemo(() => buildArmOptions(classes ?? []), [classes]);
  const allOptions = useMemo(() => groups.flatMap((g) => g.options), [groups]);
  const selectedId = armId ?? allOptions[0]?.armId ?? null;
  const selected = allOptions.find((o) => o.armId === selectedId) ?? null;

  // The class owning the selected arm — needed to rank a subject across every
  // arm under it, which is a different question from ranking within one.
  const parentClass = useMemo(
    () => (classes ?? []).find((k) => k.arms.some((a) => a.id === selectedId)) ?? null,
    [classes, selectedId],
  );
  const canSpanClass = !!parentClass && parentClass.arms.length > 1;

  const { data: offerings } = useArmSubjects(selectedId);
  const activeSubjectId = subjectId ?? offerings?.[0]?.subject.id ?? null;

  const overall = useOverallLeaderboard(mode === "overall" ? selectedId : null, term.periodId);
  const subject = useSubjectLeaderboard(
    mode === "subject" ? activeSubjectId : null,
    term.periodId,
    acrossClass && canSpanClass
      ? { classId: parentClass.id }
      : selectedId
        ? { classArmId: selectedId }
        : null,
  );

  const board = mode === "overall" ? overall : subject;

  if (term.isPending || classesLoading) {
    return <p className="text-sm text-n-400" role="status">Loading classes…</p>;
  }
  if (isError) {
    return <ErrorState error={error} resourceLabel="your classes" />;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Leaderboard</h1>
          <p className="mt-1 text-sm text-n-500">
            Who&rsquo;s top of the class — overall, or in a single subject.
          </p>
        </div>
        {term.label && <TermBadge label={term.label} isCurrent={term.isViewingCurrentTerm} />}
      </div>

      {!term.hasTerms ? (
        <NoTermsNotice consequence="there's nothing to rank" />
      ) : allOptions.length === 0 ? (
        <p className="text-sm text-n-400 italic">No classes yet.</p>
      ) : (
        <>
          <LeaderboardFilters
            mode={mode}
            onModeChange={setMode}
            groups={groups}
            armId={selectedId}
            onArmChange={setArmId}
            offerings={offerings ?? []}
            subjectId={activeSubjectId}
            onSubjectChange={setSubjectId}
            className={canSpanClass ? parentClass.name : null}
            acrossClass={acrossClass}
            onAcrossClassChange={setAcrossClass}
            termGroups={term.groups}
            periodId={term.periodId}
            onPeriodChange={term.setPeriodId}
          />

          <div className="rounded-xl border border-n-200 bg-white">
            {board.isPending ? (
              <p className="p-5 text-sm text-n-400" role="status">Loading…</p>
            ) : board.isError ? (
              <div className="p-5">
                <ErrorState error={board.error} resourceLabel="this leaderboard" />
              </div>
            ) : board.rows.length === 0 ? (
              <LeaderboardEmpty mode={mode} armLabel={selected?.label ?? null} />
            ) : (
              <LeaderboardTable
                rows={board.rows}
                unit={mode === "overall" ? "%" : ""}
                showArm={mode === "subject" && subject.acrossClass}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
