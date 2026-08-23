"use client";

import { useMemo, useState } from "react";

import { ErrorState } from "@/components/shared/error-state";
import { useAcademicSessions } from "@/features/settings/hooks/use-academic-sessions";
import { useClasses } from "@/features/settings/hooks/use-classes";
import { useHasSchoolPermission } from "@/lib/auth/use-school-permission";
import { buildArmOptions } from "@/lib/school/arm-options";

import { usePromoteStudents, usePromotionPreview } from "../hooks/use-promotion";
import { usePromotionDraft } from "../hooks/use-promotion-draft";
import { PromotionBlockers } from "./promotion-blockers";
import { PromotionContextBar } from "./promotion-context-bar";
import { PromotionList, PromotionSubmitBar } from "./promotion-list";

// Moves a class arm's students into the next session.
//
// Insert-not-mutate: promoting writes a new Enrollment for the target session
// and leaves the source-session row alone, so a student's history survives and
// "current" for any session stays the most recent row. Partial batches are
// normal — whoever isn't ticked simply stays for a later run.
export function PromotionPage() {
  const { data: classes, isPending: classesLoading, isError, error } = useClasses();
  const { data: sessions, isPending: sessionsLoading } = useAcademicSessions();
  const canPromote = useHasSchoolPermission("edit_students");

  const [armId, setArmId] = useState<string | null>(null);
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);

  const groups = useMemo(() => buildArmOptions(classes ?? []), [classes]);
  const allOptions = useMemo(() => groups.flatMap((g) => g.options), [groups]);
  const selectedArm = armId ?? allOptions[0]?.armId ?? null;

  // The session owning the period marked current — the one students are
  // leaving. Same derivation useScoreSheets uses for the current term.
  const currentSessionId = useMemo(
    () => (sessions ?? []).find((s) => s.periods.some((p) => p.is_current))?.id ?? null,
    [sessions],
  );
  const source = sourceId ?? currentSessionId;

  const preview = usePromotionPreview(selectedArm, targetId, source);
  const promote = usePromoteStudents(selectedArm);

  const seedKey = selectedArm && source && targetId ? `${selectedArm}|${source}|${targetId}` : null;
  const draft = usePromotionDraft(preview.data, seedKey);

  if (classesLoading || sessionsLoading) {
    return <p className="text-sm text-n-400" role="status">Loading classes…</p>;
  }
  if (isError) {
    return <ErrorState error={error} resourceLabel="your classes" />;
  }

  const sessionOptions = (sessions ?? []).map((s) => ({ id: s.id, name: s.name }));
  const blocked = !canPromote || allOptions.length === 0 || sessionOptions.length < 2;

  async function submit() {
    if (!source || !targetId || draft.assignments.length === 0) return;
    const moved = draft.assignments.map((a) => a.student_id);
    try {
      await promote.mutateAsync({
        source_session_id: source,
        target_session_id: targetId,
        assignments: draft.assignments,
      });
      // Locks these rows for this sitting. The preview is scoped to the *source*
      // session, so it will keep returning them — see usePromotionDraft.
      draft.markCommitted(moved);
    } catch {
      // Error already toasted, and the service runs every check before any
      // write, so nothing was created and the payload can just be corrected.
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Promotion</h1>
        <p className="mt-1 text-sm text-n-500">
          Move a class into next session. Everyone keeps their history — this adds their new
          class rather than overwriting the old one.
        </p>
      </div>

      <PromotionBlockers
        canPromote={canPromote}
        hasClasses={allOptions.length > 0}
        sessionCount={sessionOptions.length}
      />

      {blocked ? null : (
        <>
          <PromotionContextBar
            armGroups={groups}
            armId={selectedArm}
            onArmChange={setArmId}
            sessions={sessionOptions}
            sourceSessionId={source}
            onSourceChange={setSourceId}
            targetSessionId={targetId}
            onTargetChange={setTargetId}
          />

          {!targetId ? (
            <p className="text-sm text-n-400 italic">
              Choose the session these students are joining to see who moves.
            </p>
          ) : (
            <>
              {draft.committedCount > 0 && (
                <p className="rounded-lg border border-n-200 bg-n-50 px-3.5 py-2.5 text-xs text-n-600">
                  {draft.committedCount} already enrolled in the session they&rsquo;re joining.
                  They stay listed because the preview reads the class they&rsquo;re leaving,
                  but they&rsquo;re locked here so they can&rsquo;t be sent twice.
                </p>
              )}

              <PromotionList
                rows={draft.rows}
                armGroups={groups}
                isPending={preview.isPending}
                isError={preview.isError}
                error={preview.error}
                unresolved={draft.unresolved}
                onSetAll={draft.setAllDestinations}
                onDestinationChange={draft.setDestination}
                onToggle={draft.toggle}
              />

              {draft.rows.length > 0 && (
                <PromotionSubmitBar
                  count={draft.assignments.length}
                  isPending={promote.isPending}
                  onSubmit={submit}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
