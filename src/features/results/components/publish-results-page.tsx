"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Download, Eye, FileText, Lock, LockOpen, Table2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ArmPicker } from "@/components/shared/arm-picker";
import { TermPicker } from "@/components/shared/term-picker";
import { ErrorState } from "@/components/shared/error-state";
import { useRoster } from "@/features/attendance/hooks/use-register";
import { useClasses } from "@/features/settings/hooks/use-classes";
import { buildArmOptions } from "@/lib/school/arm-options";
import { useTermSelection } from "@/lib/school/use-term-selection";
import { cn } from "@/lib/utils";
import { formatTimestamp } from "@/lib/text/format-timestamp";

import { useArmSubjects } from "@/features/teaching-assignments/hooks/use-arm-subjects";
import { useArmAssignments } from "@/features/teaching-assignments/hooks/use-arm-assignments";

import { useReviewQueue } from "../hooks/use-review-queue";
import {
  useClassArmResults,
  useLockClassArmResult,
  useUnlockClassArmResult,
} from "../hooks/use-report-card";
import { useDownloadReportCard } from "../hooks/use-report-card-export";
import { BulkExportButtons } from "./bulk-export-buttons";
import type { ResultSubmission } from "../types";
import { NoTermsNotice } from "./no-terms-notice";
import { ReportCardDialog } from "./report-card-dialog";
import { ReportCardPreviewDialog } from "./report-card-preview-dialog";
import { ReviewActionDialog } from "./review-action-dialog";
import { TermBadge } from "./term-badge";

// Locking is the moment results become real: it snapshots the arm's subjects,
// computes every position and average, and is the first point a parent or
// student may see anything at all. Before it, they get a 403 by design.
//
// So this screen leads with what's blocking the lock rather than with a button —
// the backend refuses until every offered subject is APPROVED, and an admin's
// actual question is "who am I waiting on".
export function PublishResultsPage() {
  // Publishing a past term is legitimate — a school that fell behind still has
  // to lock last term before report cards go out. The badge turns amber when the
  // selected term isn't the current one, because locking the wrong term is not a
  // mistake you want to make quietly.
  const term = useTermSelection();
  const { data: classes, isPending: classesLoading, isError, error } = useClasses();
  const [armId, setArmId] = useState<string | null>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [viewingStudent, setViewingStudent] = useState<{ id: string; name: string } | null>(null);
  const [previewingStudent, setPreviewingStudent] = useState<{ id: string; name: string } | null>(
    null,
  );

  const groups = useMemo(() => buildArmOptions(classes ?? []), [classes]);
  const allOptions = useMemo(() => groups.flatMap((g) => g.options), [groups]);
  const selectedId = armId ?? allOptions[0]?.armId ?? null;
  const selected = allOptions.find((o) => o.armId === selectedId) ?? null;

  const { data: submissions } = useReviewQueue(term.periodId);
  const { data: batches } = useClassArmResults(term.periodId);
  // Period-scoped: publishing a past term must show who was ACTUALLY in this
  // arm that term, not today's roster — a student promoted since (Creche 2 →
  // Nursery 1, say) would otherwise vanish from last term's Creche 2 list and
  // wrongly turn up in Nursery 1's.
  const { data: roster, isPending: rosterLoading } = useRoster(selectedId, term.periodId);
  // The definitive list the backend locks against.
  const { data: offerings } = useArmSubjects(selectedId);
  // Only to explain *why* a subject has no scores yet.
  const { data: assignments } = useArmAssignments(selectedId);
  const lock = useLockClassArmResult();
  const unlock = useUnlockClassArmResult();
  const download = useDownloadReportCard();

  const batch = useMemo(
    () => (batches ?? []).find((b) => b.class_arm === selectedId) ?? null,
    [batches, selectedId],
  );
  const isLocked = batch?.is_locked ?? false;

  // What the lock is waiting on — computed from what the arm *offers*, not from
  // the submissions that happen to exist.
  //
  // The backend checks ClassArmSubjectOffering: every subject an arm takes needs
  // an approved result, whether or not anyone has been assigned to teach it. A
  // submission row is only created when a teacher first enters a score, so
  // counting those made every unstaffed subject invisible — this screen said
  // "All 2 subjects approved" while the server refused the lock and named
  // twenty more.
  const offeredSubjects = useMemo(() => (offerings ?? []).map((o) => o.subject), [offerings]);

  const submissionBySubject = useMemo(() => {
    const map = new Map<string, ResultSubmission>();
    (submissions ?? []).forEach((s) => {
      if (s.class_arm === selectedId) map.set(s.subject, s);
    });
    return map;
  }, [submissions, selectedId]);

  const teacherCountBySubject = useMemo(() => {
    const map = new Map<string, number>();
    (assignments ?? []).forEach((a) => {
      map.set(a.subject.id, (map.get(a.subject.id) ?? 0) + 1);
    });
    return map;
  }, [assignments]);

  // Each offered subject with the reason it is or isn't ready. Naming the reason
  // is the point: "no teacher assigned" is a different job from "teacher hasn't
  // submitted", and only one of them is chased by talking to a teacher.
  const subjectStates = useMemo(
    () =>
      offeredSubjects.map((subject) => {
        const submission = submissionBySubject.get(subject.id);
        const hasTeacher = (teacherCountBySubject.get(subject.id) ?? 0) > 0;
        if (submission?.status === "approved") {
          return { subject, ready: true, reason: "Approved" };
        }
        if (submission) {
          return {
            subject,
            ready: false,
            reason:
              submission.status === "submitted"
                ? "Awaiting your review"
                : submission.status === "rejected"
                  ? "Sent back, not resubmitted"
                  : "Scores started, not submitted",
          };
        }
        return {
          subject,
          ready: false,
          reason: hasTeacher ? "No scores entered yet" : "No teacher assigned",
        };
      }),
    [offeredSubjects, submissionBySubject, teacherCountBySubject],
  );

  const outstanding = useMemo(() => subjectStates.filter((s) => !s.ready), [subjectStates]);
  const approvedCount = subjectStates.length - outstanding.length;
  const unstaffed = outstanding.filter((s) => s.reason === "No teacher assigned").length;

  const students = roster?.students;

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
          <h1 className="font-display text-2xl font-bold text-ink">Publish results</h1>
          <p className="mt-1 text-sm text-n-500">
            Lock a class&rsquo;s results to compute positions and release report cards to
            parents and students.
          </p>
        </div>
        {term.label && <TermBadge label={term.label} isCurrent={term.isViewingCurrentTerm} />}
      </div>

      {!term.hasTerms ? (
        <NoTermsNotice consequence="there are no results to publish" />
      ) : allOptions.length === 0 ? (
        <p className="text-sm text-n-400 italic">No classes yet.</p>
      ) : (
        <>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="flex flex-wrap items-end gap-3">
              <ArmPicker groups={groups} value={selectedId} onChange={setArmId} label="Class" />
              <TermPicker
                groups={term.groups}
                value={term.periodId}
                onChange={term.setPeriodId}
                label="Term"
              />
            </div>
            {/* The subject-by-subject state above answers "is this ready to
                publish"; the broadsheet is the actual grid of scores behind
                that answer, for the same arm and term — legitimately useful
                whether or not this class has been locked yet. */}
            {selectedId && term.periodId && (
              <Button type="button" variant="outline" size="sm" asChild className="h-8 shrink-0 text-xs">
                <Link href={`/results/broadsheet?arm=${selectedId}&period=${term.periodId}`}>
                  <Table2 className="size-3.5 mr-1" />
                  View broadsheet
                </Link>
              </Button>
            )}
          </div>

          <div className="rounded-xl border border-n-200 bg-white p-5">
            {isLocked ? (
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-grass/10">
                  <Lock className="size-4 text-grass" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">Results are published</p>
                  <p className="mt-0.5 text-sm text-n-500">
                    Parents and students can see their report cards.
                    {batch?.locked_at && ` Locked ${formatTimestamp(batch.locked_at)}`}
                    {batch?.locked_by && ` by ${batch.locked_by.first_name} ${batch.locked_by.last_name}`}
                    .
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setUnlocking(true)}
                  className="shrink-0"
                >
                  <LockOpen className="size-3.5 mr-1.5" />
                  Unpublish
                </Button>
              </div>
            ) : subjectStates.length === 0 ? (
              <div>
                <p className="text-sm font-medium text-ink">
                  {selected?.label ?? "This class"} takes no subjects yet
                </p>
                <p className="mt-1 text-sm text-n-500">
                  There&rsquo;s nothing to publish until subjects are added to it in{" "}
                  <Link href="/teaching-assignments" className="text-primary hover:underline">
                    Teaching Assignments
                  </Link>
                  .
                </p>
              </div>
            ) : outstanding.length > 0 ? (
              <div>
                <p className="text-sm font-medium text-ink">
                  {approvedCount} of {subjectStates.length} subject
                  {subjectStates.length === 1 ? "" : "s"} ready
                </p>
                <p className="mt-1 text-sm text-n-500">
                  Every subject this class <em>takes</em> needs an approved result — not only the
                  ones with a teacher.
                  {unstaffed > 0 && (
                    <>
                      {" "}
                      {unstaffed} {unstaffed === 1 ? "has" : "have"} nobody assigned: either give{" "}
                      {unstaffed === 1 ? "it a teacher" : "them teachers"} in{" "}
                      <Link href="/teaching-assignments" className="text-primary hover:underline">
                        Teaching Assignments
                      </Link>
                      , or remove {unstaffed === 1 ? "it" : "them"} from what this class takes.
                    </>
                  )}
                </p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {outstanding.map(({ subject, reason }) => (
                    <li
                      key={subject.id}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-xs text-ink",
                        reason === "No teacher assigned"
                          ? "border-clay/40 bg-clay/10"
                          : "border-amber/40 bg-amber/10",
                      )}
                    >
                      {subject.name}
                      <span className="ml-1 text-n-500">· {reason.toLowerCase()}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">Ready to publish</p>
                  <p className="mt-0.5 text-sm text-n-500">
                    All {approvedCount} subject{approvedCount === 1 ? "" : "s"} this class takes
                    are approved. Locking computes positions and averages, then releases report
                    cards.
                  </p>
                </div>
                <Button
                  type="button"
                  disabled={approvedCount === 0 || lock.isPending}
                  onClick={() =>
                    selectedId &&
                    term.periodId &&
                    lock.mutate({ classArmId: selectedId, periodId: term.periodId })
                  }
                  className="shrink-0"
                >
                  <Lock className="size-3.5 mr-1.5" />
                  {lock.isPending ? "Publishing…" : "Publish results"}
                </Button>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-n-200 bg-white">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-n-100 px-5 py-3">
              {/* Own line on a phone (basis-full), so the two export buttons sit
                  together beneath it instead of one beside the title and one
                  stranded on a third line. */}
              <p className="mr-auto basis-full text-xs text-n-500 sm:basis-auto">
                Report cards {isLocked ? "" : "— preview only until published"}
              </p>
              {students && students.length > 0 && term.periodId && selectedId && (
                <BulkExportButtons
                  classArmId={selectedId}
                  periodId={term.periodId}
                  armLabel={selected?.label ?? "class"}
                />
              )}
            </div>
            {rosterLoading ? (
              <p className="p-5 text-sm text-n-400" role="status">Loading students…</p>
            ) : !students || students.length === 0 ? (
              <p className="p-5 text-sm text-n-400 italic">
                No students are enrolled in {selected?.label ?? "this class"} for this term.
              </p>
            ) : (
              <ul className="divide-y divide-n-100">
                {students.map((student) => {
                  const name = `${student.user.first_name} ${student.user.last_name}`;
                  return (
                    <li key={student.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                      {/* Full line on a phone: the three buttons beside it
                          left the name ~90px and cut it to "Ifeanyi O…", with
                          PDF orphaned on its own line. They wrap beneath now. */}
                      <span className="min-w-0 basis-full sm:flex-1 sm:basis-0">
                        <span className="block text-sm text-ink sm:truncate">{name}</span>
                        <span className="block font-mono text-[11px] text-n-400 sm:truncate">
                          {student.admission_number}
                        </span>
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingStudent({ id: student.id, name })}
                        className="h-8 shrink-0 text-xs text-primary"
                      >
                        <FileText className="size-3.5 mr-1" />
                        View
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setPreviewingStudent({ id: student.id, name })}
                        className="h-8 shrink-0 text-xs text-primary"
                      >
                        <Eye className="size-3.5 mr-1" />
                        Preview report card
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={download.isPending}
                        onClick={() =>
                          term.periodId &&
                          download.mutate({
                            studentId: student.id,
                            periodId: term.periodId,
                            admissionNumber: student.admission_number,
                          })
                        }
                        className="h-8 shrink-0 text-xs"
                      >
                        <Download className="size-3.5 mr-1" />
                        PDF
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}

      <ReviewActionDialog
        open={unlocking}
        onOpenChange={setUnlocking}
        title={`Unpublish ${selected?.label ?? "this class"}?`}
        description="Report cards stop being visible to parents and students, and positions are cleared until it's published again. The reason is recorded in the audit log."
        label="Reason for unpublishing"
        placeholder="e.g. A Maths score was entered against the wrong student."
        confirmLabel="Unpublish"
        required
        destructive
        isPending={unlock.isPending}
        onConfirm={(reason) =>
          unlock.mutateAsync({
            classArmId: selectedId as string,
            periodId: term.periodId!,
            reason,
          })
        }
      />

      {viewingStudent && term.periodId && (
        <ReportCardDialog
          open={!!viewingStudent}
          onOpenChange={(next) => !next && setViewingStudent(null)}
          studentId={viewingStudent.id}
          studentName={viewingStudent.name}
          academicPeriodId={term.periodId}
        />
      )}

      {previewingStudent && term.periodId && (
        <ReportCardPreviewDialog
          open={!!previewingStudent}
          onOpenChange={(next) => !next && setPreviewingStudent(null)}
          studentId={previewingStudent.id}
          studentName={previewingStudent.name}
          academicPeriodId={term.periodId}
        />
      )}
    </div>
  );
}
