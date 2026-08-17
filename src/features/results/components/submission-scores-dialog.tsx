"use client";

import { useMemo } from "react";
import { TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRoster } from "@/features/attendance/hooks/use-register";
import { useGradingSystems } from "@/features/settings/hooks/use-grading-systems";
import { useClasses } from "@/features/settings/hooks/use-classes";
import { ErrorState } from "@/components/shared/error-state";

import { useScores } from "../hooks/use-scores";
import type { ResultSubmission } from "../types";

interface Props {
  submission: ResultSubmission;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: () => void;
  onSendBack: () => void;
  isApproving: boolean;
}

// The marks themselves, which review had no way of showing.
//
// Approving or sending back a subject without seeing its scores is a decision
// made on a status chip alone — there's nothing to judge and nothing to write in
// a rejection note. So the grid is the review screen: the same students,
// components and totals the teacher filled in, plus the one thing a reviewer
// needs that the teacher's own view doesn't emphasise — who is missing marks.
export function SubmissionScoresDialog({
  submission,
  open,
  onOpenChange,
  onApprove,
  onSendBack,
  isApproving,
}: Props) {
  const filters = {
    class_arm_id: submission.class_arm,
    subject_id: submission.subject,
    academic_period_id: submission.academic_period,
  };

  const { data: scoreData, isPending, isError, error } = useScores(open ? filters : {});
  const { data: roster } = useRoster(open ? submission.class_arm : null);
  const { data: classes } = useClasses();
  const { data: gradingSystems } = useGradingSystems();

  // Components come from the arm's level so the columns keep the school's own
  // order (1st CA before Exam), rather than whatever order scores came back in.
  const level = useMemo(
    () => (classes ?? []).find((k) => k.arms.some((a) => a.id === submission.class_arm))?.level,
    [classes, submission.class_arm],
  );
  const components = useMemo(() => {
    const system = (gradingSystems ?? []).find((g) => g.level === level);
    return [...(system?.components ?? [])].sort((a, b) => a.order - b.order);
  }, [gradingSystems, level]);

  const scores = scoreData?.scores;

  // Keyed "studentId|componentId".
  const byCell = useMemo(() => {
    const map = new Map<string, number>();
    (scores ?? []).forEach((s) => {
      if (s.grade_component) map.set(`${s.student.id}|${s.grade_component}`, Number(s.score_obtained));
    });
    return map;
  }, [scores]);

  // Roster first so a student with no marks at all still gets a row — their
  // absence is the most reviewable thing on the screen. Falls back to whoever
  // appears in the scores if the roster can't be read.
  const students = useMemo(() => {
    if (roster?.students?.length) return roster.students;
    const seen = new Map<string, { id: string; user: { first_name: string; last_name: string }; admission_number: string }>();
    (scores ?? []).forEach((s) => seen.set(s.student.id, s.student));
    return [...seen.values()];
  }, [roster, scores]);

  const rows = useMemo(
    () =>
      students.map((student) => {
        const cells = components.map((c) => byCell.get(`${student.id}|${c.id}`));
        const entered = cells.filter((v) => v !== undefined).length;
        const total = cells.reduce<number>((sum, v) => sum + (v ?? 0), 0);
        return { student, cells, entered, total, complete: entered === components.length };
      }),
    [students, components, byCell],
  );

  const incomplete = rows.filter((r) => !r.complete).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {submission.subject_name} — {submission.arm_name || submission.class_name}
          </DialogTitle>
        </DialogHeader>

        {isPending ? (
          <p className="py-8 text-center text-sm text-n-400" role="status">Loading scores…</p>
        ) : isError ? (
          <ErrorState error={error} resourceLabel="these scores" />
        ) : rows.length === 0 ? (
          <p className="py-8 text-center text-sm text-n-400 italic">
            No scores have been entered for this subject.
          </p>
        ) : (
          <div className="space-y-3">
            {incomplete > 0 && (
              <p className="flex items-start gap-2 rounded-lg border border-amber/40 bg-amber/10 px-3.5 py-2.5 text-xs text-ink">
                <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-amber" />
                <span>
                  {incomplete} of {rows.length} student{rows.length === 1 ? "" : "s"} {incomplete === 1 ? "is" : "are"} missing
                  at least one score. Worth checking before you approve.
                </span>
              </p>
            )}

            <div className="max-h-[26rem] overflow-auto rounded-lg border border-n-200">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-n-50">
                  <tr className="text-left">
                    <th className="px-3 py-2 font-medium text-n-500">Student</th>
                    {components.map((c) => (
                      <th key={c.id} className="px-3 py-2 text-right font-medium text-n-500">
                        {c.name}
                        <span className="block font-mono text-[10px] font-normal text-n-400">
                          /{c.max_obtainable}
                        </span>
                      </th>
                    ))}
                    <th className="px-3 py-2 text-right font-medium text-n-500">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-n-100">
                  {rows.map(({ student, cells, total, complete }) => (
                    <tr key={student.id} className={complete ? undefined : "bg-amber/5"}>
                      <td className="px-3 py-2">
                        <span className="block truncate text-ink">
                          {student.user.first_name} {student.user.last_name}
                        </span>
                        <span className="block font-mono text-[10px] text-n-400">
                          {student.admission_number}
                        </span>
                      </td>
                      {cells.map((value, i) => (
                        <td
                          key={components[i].id}
                          className="px-3 py-2 text-right tabular-nums text-ink"
                        >
                          {/* A dash, not a zero: no mark and a mark of nought are
                              different facts, and only one of them is a problem. */}
                          {value === undefined ? <span className="text-clay">—</span> : value}
                        </td>
                      ))}
                      <td className="px-3 py-2 text-right font-medium tabular-nums text-ink">
                        {Number(total.toFixed(2))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* The decision lives with the evidence. Sending it back from here means
            the reviewer can name the exact gap they just spotted. */}
        {submission.status === "submitted" && (
          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={onSendBack}
              className="text-clay hover:bg-clay/10 hover:text-clay"
            >
              Send back
            </Button>
            <Button type="button" onClick={onApprove} disabled={isApproving}>
              {isApproving ? "Approving…" : "Approve"}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
