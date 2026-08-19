"use client";

import { useMemo, useState } from "react";

import { ErrorState } from "@/components/shared/error-state";
import { ArmPicker } from "@/components/shared/arm-picker";
import { useRoster } from "@/features/attendance/hooks/use-register";
import { useClasses } from "@/features/settings/hooks/use-classes";
import { buildArmOptions } from "@/lib/school/arm-options";
import { useHasSchoolPermission } from "@/lib/auth/use-school-permission";

import { NoCurrentTermNotice } from "./no-current-term-notice";
import { TermBadge } from "./term-badge";
import { useScoreSheets } from "../hooks/use-score-sheets";
import { useRemarks, useSetPrincipalRemark } from "../hooks/use-traits";
import type { StudentResultRemark } from "../types";
import { useBroadsheet, type BroadsheetGridRow } from "../hooks/use-broadsheet";
import { PrincipalRemarkRow } from "./principal-remark-row";

// The principal's half of the report card. Separate from the form teacher's
// screen because it's a different person doing a different job at a different
// time — and it's permission-gated (manage_remarks) rather than identity-gated,
// so an admin writes for any class rather than only their own.
//
// The teacher's remark is shown above the field, read-only. A principal writing
// blind, without the remark the form teacher already made, would produce two
// comments that contradict each other on the same page.
export function PrincipalRemarksPage() {
  const { currentTerm, isPending: termLoading } = useScoreSheets();
  const { data: classes, isPending: classesLoading, isError, error } = useClasses();
  const [armId, setArmId] = useState<string | null>(null);

  const groups = useMemo(() => buildArmOptions(classes ?? []), [classes]);
  const allOptions = useMemo(() => groups.flatMap((g) => g.options), [groups]);
  const selectedId = armId ?? allOptions[0]?.armId ?? null;
  const selected = allOptions.find((o) => o.armId === selectedId) ?? null;

  const { data: roster, isPending: rosterLoading } = useRoster(selectedId);
  // The term's scores, so the head writes their remark against the result
  // rather than against the teacher's sentence alone. Same source the
  // broadsheet uses — one request per arm, roster-reconciled.
  const { rows: resultRows, columns: resultColumns } = useBroadsheet(selectedId, currentTerm?.id);
  const resultByStudent = useMemo(() => {
    const map = new Map<string, BroadsheetGridRow>();
    resultRows.forEach((r) => map.set(r.studentId, r));
    return map;
  }, [resultRows]);
  const { data: remarks } = useRemarks(selectedId, currentTerm?.id);
  const setRemark = useSetPrincipalRemark();

  // Being an admin is enough to reach this page; writing the remark needs
  // manage_remarks specifically. Without the check an admin lacking it could
  // type a comment for every student and collect a 403 on each save.
  const canWrite = useHasSchoolPermission("manage_remarks");

  const byStudent = useMemo(() => {
    const map = new Map<string, StudentResultRemark>();
    (remarks ?? []).forEach((r) => map.set(r.student.id, r));
    return map;
  }, [remarks]);

  const students = roster?.students;

  if (termLoading || classesLoading) {
    return <p className="text-sm text-n-400" role="status">Loading classes…</p>;
  }

  if (isError) {
    return <ErrorState error={error} resourceLabel="your classes" />;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Principal&rsquo;s remarks</h1>
          <p className="mt-1 text-sm text-n-500">
            Add the head&rsquo;s comment to each student&rsquo;s report card.
          </p>
        </div>
        {currentTerm && <TermBadge label={currentTerm.label} />}
      </div>

      {!canWrite ? (
        <p className="rounded-lg border border-n-200 bg-n-50 px-3.5 py-2.5 text-sm text-n-600">
          Your role doesn&rsquo;t include permission to write principal&rsquo;s remarks. An
          administrator can grant it under Roles &amp; Permissions.
        </p>
      ) : !currentTerm ? (
        <NoCurrentTermNotice consequence="there are no report cards to remark on" />
      ) : allOptions.length === 0 ? (
        <p className="text-sm text-n-400 italic">No classes yet.</p>
      ) : (
        <>
          <ArmPicker groups={groups} value={selectedId} onChange={setArmId} label="Class" />

          <div className="rounded-xl border border-n-200 bg-white">
            {rosterLoading ? (
              <p className="p-5 text-sm text-n-400" role="status">Loading students…</p>
            ) : !students || students.length === 0 ? (
              <p className="p-5 text-sm text-n-400 italic">
                No students are enrolled in {selected?.label ?? "this class"} for this term.
              </p>
            ) : (
              <ul className="divide-y divide-n-100">
                {students.map((student) => (
                  <PrincipalRemarkRow
                    key={student.id}
                    student={student}
                    remark={byStudent.get(student.id)}
                    resultRow={resultByStudent.get(student.id)}
                    resultColumns={resultColumns}
                    isSaving={setRemark.isPending}
                    onSave={(text) => {
                      if (!selectedId || !currentTerm) return;
                      setRemark.mutate({
                        student_id: student.id,
                        class_arm_id: selectedId,
                        academic_period_id: currentTerm.id,
                        remark: text,
                      });
                    }}
                  />
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
