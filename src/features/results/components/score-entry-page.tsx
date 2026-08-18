"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Info, Lock, TriangleAlert, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { ErrorState } from "@/components/shared/error-state";
import { OfflineNotice } from "@/components/shared/offline-notice";
import { useRoster } from "@/features/attendance/hooks/use-register";
import { formatTimestamp } from "@/lib/text/format-timestamp";
import { useIsSchoolAdmin } from "@/lib/auth/use-personas";
import { SyncStatusStrip } from "@/features/attendance/components/sync-status-strip";
import { cn } from "@/lib/utils";

import { useEnterScores } from "../hooks/use-enter-scores";
import { useScoreDraft, scoreError } from "../hooks/use-score-draft";
import { useLastScoreRejection } from "../hooks/use-score-sync";
import { TermBadge } from "./term-badge";
import { useScoreSheets } from "../hooks/use-score-sheets";
import { useScores, useSubmission } from "../hooks/use-scores";
import type { SubmissionStatus } from "../types";
import { ComponentTabs } from "./component-tabs";
import { ScoreRow } from "./score-row";
import { SubmitResultBar } from "./submit-result-bar";

// Only APPROVED locks entry. DRAFT, SUBMITTED and REJECTED all stay editable —
// the backend is explicit about that, and a teacher correcting a rejected sheet
// is the whole point of REJECTED.
const STATUS_META: Record<SubmissionStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-n-100 text-n-500" },
  submitted: { label: "Submitted for review", className: "bg-primary/10 text-primary" },
  approved: { label: "Approved — locked", className: "bg-grass/10 text-grass" },
  rejected: { label: "Sent back for correction", className: "bg-clay/10 text-clay" },
};

export function ScoreEntryPage() {
  const {
    sheets,
    currentTerm,
    componentsForLevel,
    isTeacher,
    isPending,
    unavailableOffline: sheetsUnavailableOffline,
    isError,
    error,
  } = useScoreSheets();
  // Both blocked states below are fixed in Settings, which is admin-only. A
  // teacher still gets told what is wrong — just not pointed at a door that
  // won't open for them.
  const isAdmin = useIsSchoolAdmin();
  const [sheetKey, setSheetKey] = useState<string | null>(null);
  const [componentId, setComponentId] = useState<string | null>(null);

  const sheet = sheets.find((s) => s.key === sheetKey) ?? sheets[0] ?? null;
  const components = sheet ? (componentsForLevel.get(sheet.level) ?? []) : [];
  const activeComponentId = componentId ?? components[0]?.id ?? null;
  const activeComponent = components.find((c) => c.id === activeComponentId) ?? null;

  const filters = {
    class_arm_id: sheet?.classArmId,
    subject_id: sheet?.subjectId,
    academic_period_id: currentTerm?.id,
  };

  const {
    data: roster,
    isPending: rosterLoading,
    isPaused: rosterPaused,
  } = useRoster(sheet?.classArmId ?? null);
  const {
    data: scoreData,
    isPending: scoresLoading,
    isPaused: scoresPaused,
    // Bumped on every successful fetch, so the draft knows when a colleague's
    // entry on another device has landed and the boxes need refreshing.
    dataUpdatedAt: scoresUpdatedAt,
  } = useScores(filters);
  const { data: submission } = useSubmission(filters);
  const enterScores = useEnterScores();

  const students = roster?.students;
  const scores = scoreData?.scores;
  const { draft, queued, changed, setScore, clearAll, totals } = useScoreDraft(
    {
      classArmId: sheet?.classArmId,
      subjectId: sheet?.subjectId,
      academicPeriodId: currentTerm?.id,
      gradeComponentId: activeComponentId,
    },
    scores,
    students,
    scoresUpdatedAt,
    activeComponent?.max_obtainable ?? 0,
  );
  const rejection = useLastScoreRejection();
  const [dismissedRejectionId, setDismissedRejectionId] = useState<number | null>(null);

  // Offline with nothing cached for this sheet. Told apart from a real load so
  // the page says so rather than spinning on a request that cannot resolve.
  const unavailableOffline = (scoresPaused && !scores) || (rosterPaused && !roster);

  const status: SubmissionStatus = submission?.status ?? "draft";
  const locked = status === "approved";

  // Per-component progress for the tabs, counted from saved scores rather than
  // the draft — the tabs report what the school has, not what's typed.
  const enteredByComponent = useMemo(() => {
    const counts = new Map<string, number>();
    (scores ?? []).forEach((s) => {
      if (!s.grade_component) return;
      counts.set(s.grade_component, (counts.get(s.grade_component) ?? 0) + 1);
    });
    return counts;
  }, [scores]);

  const invalidCount = useMemo(() => {
    if (!activeComponent) return 0;
    return Object.values(draft).filter((v) => scoreError(v, activeComponent.max_obtainable)).length;
  }, [draft, activeComponent]);

  const enteredNow = Object.values(draft).filter((v) => v.trim() !== "").length;
  // Across every component, not just the visible column: submitting freezes the
  // whole subject, so the count has to describe the whole subject.
  const savedAcrossSheet = scores?.length ?? 0;
  const isSubmitting = enterScores.isPending && !enterScores.isPaused;
  const queuedCount = Object.keys(queued).length;

  function focusNext(index: number) {
    const next = document.querySelector<HTMLInputElement>(`[data-score-input="${index + 1}"]`);
    next?.focus();
  }

  function submit() {
    if (!sheet || !activeComponentId || !currentTerm || changed.length === 0) return;
    setDismissedRejectionId(rejection?.id ?? null);
    const markedAt = new Date().toISOString();
    enterScores.mutate({
      class_arm_id: sheet.classArmId,
      subject_id: sheet.subjectId,
      academic_period_id: currentTerm.id,
      entries: changed.map(([student_id, value]) => ({
        student_id,
        grade_component_id: activeComponentId,
        score: Number(value.trim()),
        marked_at: markedAt,
      })),
    });
  }

  // Reachable only if a teacher persona was removed while the screen was open —
  // RouteAccessGuard stops a plain admin getting here. Worth handling anyway,
  // because the alternative is the raw "Only teachers have subject assignments."
  if (!isTeacher) {
    return (
      <div className="rounded-xl border border-n-200 bg-white p-8 text-center">
        <p className="text-sm font-medium text-ink">Score entry is for teachers</p>
        <p className="mx-auto mt-1.5 max-w-md text-sm text-n-500">
          Scores are entered by the teacher assigned to a subject in a class — there&rsquo;s no
          administrator override. As an admin you can approve them in{" "}
          <Link href="/results/review" className="text-primary hover:underline">
            Result Review
          </Link>{" "}
          and release them in{" "}
          <Link href="/results/publish" className="text-primary hover:underline">
            Publish Results
          </Link>
          .
        </p>
      </div>
    );
  }

  if (sheetsUnavailableOffline) {
    return <OfflineNotice resourceLabel="Your subjects and classes" />;
  }

  if (isPending) {
    return <p className="text-sm text-n-400" role="status">Loading your subjects…</p>;
  }

  if (isError) {
    return <ErrorState error={error} resourceLabel="your subjects" />;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Score entry</h1>
          <p className="mt-1 text-sm text-n-500">
            Record scores for the subjects you teach. Each assessment is saved on its own.
          </p>
        </div>
        {currentTerm && <TermBadge label={currentTerm.label} />}
      </div>

      <SyncStatusStrip />

      {/* A whole-batch refusal, kept on screen rather than left to a toast.
          Scores are the one queue that can be rejected outright — the backend
          refuses the entire batch if the subject was approved between entry and
          sync — so the teacher needs to see it whenever they arrive, including
          after it failed in the background on another screen. The draft is never
          cleared on this path, so what they typed is still in the column. */}
      {rejection && rejection.id !== dismissedRejectionId && (
        <div className="flex items-start gap-2.5 rounded-lg border border-clay/30 bg-clay/5 px-3.5 py-3">
          <TriangleAlert className="mt-0.5 size-4 shrink-0 text-clay" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink">
              {rejection.entryCount} score{rejection.entryCount === 1 ? "" : "s"} couldn&rsquo;t be
              saved
            </p>
            <p className="mt-0.5 text-sm text-n-600">{rejection.message}</p>
            <p className="mt-1 text-xs text-n-400">
              They&rsquo;re still in the column below — nothing you typed was lost.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDismissedRejectionId(rejection.id)}
            aria-label="Dismiss"
            className="shrink-0 cursor-pointer text-n-400 transition-colors hover:text-ink"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Every gate that can stop this screen working, each naming its own fix.
          A teacher hitting one of these can't be left guessing which of the
          three it is. */}
      {!currentTerm ? (
        <p className="rounded-lg border border-amber/40 bg-amber/10 px-3.5 py-2.5 text-sm text-ink">
          No term is marked current, so there&rsquo;s nothing to record scores against.{" "}
          {isAdmin ? (
            <>
              Set one in{" "}
              <Link href="/settings/sessions" className="text-primary hover:underline">
                Sessions &amp; Terms
              </Link>
              .
            </>
          ) : (
            "Ask an administrator to mark the current term."
          )}
        </p>
      ) : sheets.length === 0 ? (
        <div className="rounded-xl border border-n-200 bg-white p-8 text-center">
          <p className="text-sm font-medium text-ink">You aren&rsquo;t assigned to any subject yet</p>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-n-500">
            Scores can only be entered by the teacher assigned to a subject in a class. An
            administrator sets that in Teaching Assignments.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <span className="text-n-500">Class &amp; subject</span>
              <Select
                value={sheet?.key ?? ""}
                onChange={(e) => {
                  setSheetKey(e.target.value);
                  // A different subject has a different mark scheme, so the
                  // selected component can't carry over.
                  setComponentId(null);
                }}
                className="min-w-56"
              >
                {sheets.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.armLabel} — {s.subjectName}
                  </option>
                ))}
              </Select>
            </label>
            <span
              className={cn(
                "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
                STATUS_META[status].className,
              )}
            >
              {locked && <Lock className="size-3.5 shrink-0" />}
              {STATUS_META[status].label}
            </span>
          </div>
          {locked && (
            <p className="flex items-start gap-2 border-n-200 bg-n-50 px-3.5 py-2.5 text-xs text-n-600">
              <Info className="mt-0.5 size-4 shrink-0 text-n-400" />
              <span>
                These scores have been approved and can no longer be changed. An administrator
                must unlock the subject before it can be corrected.
              </span>
            </p>
          )}
          {/* Attributed, because a note without an author is an instruction from
              nobody. Knowing which head of department sent it back is what tells
              a teacher whether to just fix it or go and ask. */}
          {status === "rejected" && submission?.review_comment && (
            <div className="border-clay/30 bg-clay/5 px-3.5 py-3">
              <p className="flex flex-wrap items-baseline gap-x-2 text-xs">
                <span className="font-medium">Sent back for correction</span>
                {submission.reviewed_by && (
                  <span className="text-n-500">
                    by {submission.reviewed_by.first_name} {submission.reviewed_by.last_name}
                  </span>
                )}
                {submission.reviewed_at && (
                  <span className="text-n-400">{formatTimestamp(submission.reviewed_at)}</span>
                )}
              </p>
              <p className="mt-1.5">{submission.review_comment}</p>
            </div>
          )}
          {components.length === 0 ? (
            <p className="border-amber/40 bg-amber/10 px-3.5 py-2.5">
              No grading system is set up for this level, so there are no assessments to score
              against.{" "}
              {isAdmin ? (
                <>
                  Add one in{" "}
                  <Link href="/settings/grading" className="text-primary hover:underline">
                    Grading Configuration
                  </Link>
                  .
                </>
              ) : (
                "Ask an administrator to set up grading for this level."
              )}
            </p>
          ) : (
            <>
              <ComponentTabs
                components={components}
                value={activeComponentId}
                onChange={setComponentId}
                enteredByComponent={enteredByComponent}
                total={students?.length ?? 0}
              />
              <div className="rounded-xl border-n-200 bg-white">
                {unavailableOffline ? (
                  <div className="p-5">
                    <OfflineNotice resourceLabel="This score sheet" />
                  </div>
                ) : rosterLoading || scoresLoading ? (
                  <p className="p-5 text-n-400" role="status">Loading students…</p>
                ) : !students || students.length === 0 ? (
                  <p className="p-5 text-n-400 italic">
                    No students are enrolled in {sheet?.armLabel} for this term.
                  </p>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-n-100 px-5 py-3">
                      <span className="text-xs text-n-500">
                        {students.length} student{students.length === 1 ? "" : "s"} ·{" "}
                        {enteredNow} entered
                      </span>
                      {invalidCount > 0 && (
                        <span className="text-xs text-clay">
                          {invalidCount} out of range
                        </span>
                      )}
                      {!locked && enteredNow > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={clearAll}
                          className="ml-auto h-7 text-xs text-n-500"
                        >
                          Clear column
                        </Button>
                      )}
                    </div>
                    <ul className="divide-y divide-n-100 px-5">
                      {students.map((student, index) => (
                        <ScoreRow
                          key={student.id}
                          index={index}
                          student={student}
                          value={draft[student.id] ?? ""}
                          max={activeComponent?.max_obtainable ?? 0}
                          total={totals.get(student.id)}
                          readOnly={locked}
                          onChange={(value) => setScore(student.id, value)}
                          onEnter={() => focusNext(index)}
                        />
                      ))}
                    </ul>
                    {roster && roster.total > students.length && (
                      <p className="border-t border-n-100 px-5 py-3 text-xs text-clay">
                        Showing {students.length} of {roster.total} students — this class exceeds
                        the 100-per-request limit, so the sheet is incomplete. Contact support
                        before entering scores.
                      </p>
                    )}
                    {!locked && (
                      <div className="flex flex-wrap items-center justify-end gap-3 border-t border-n-100 px-5 py-3">
                        <span className="mr-auto text-xs text-n-400">
                          {changed.length > 0
                            ? `${changed.length} unsaved change${changed.length === 1 ? "" : "s"}.`
                            : queuedCount > 0
                              ? "Saved on this device — will sync when you're back online."
                              : "No unsaved changes."}
                        </span>
                        <Button
                          type="button"
                          onClick={submit}
                          // isPaused means "queued because there's no network",
                          // which is finished work from the teacher's point of
                          // view. Only a live request should lock the button —
                          // conflating the two would strand them mid-column.
                          disabled={changed.length === 0 || invalidCount > 0 || isSubmitting}
                        >
                          {isSubmitting ? "Saving…" : "Save scores"}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </>
      )}

      {/* Below the grid on purpose: submitting is what you do after entering,
          and putting it above would invite pressing it before the work is in. */}
      {!locked && components.length > 0 && students && students.length > 0 && (
        <SubmitResultBar
          submission={submission}
          status={status}
          savedCount={savedAcrossSheet}
          unsavedCount={changed.length}
        />
      )}
    </div>
  );
}
