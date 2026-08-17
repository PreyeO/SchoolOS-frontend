"use client";

import { useMemo, useState } from "react";
import { CalendarRange } from "lucide-react";

import { ErrorState } from "@/components/shared/error-state";
import { ArmPicker } from "@/components/shared/arm-picker";
import { useRoster } from "@/features/attendance/hooks/use-register";
import { useClasses } from "@/features/settings/hooks/use-classes";
import { buildArmOptions } from "@/lib/school/arm-options";
import { useHasSchoolPermission } from "@/lib/auth/use-school-permission";

import { useScoreSheets } from "../hooks/use-score-sheets";
import { useRemarks, useSetPrincipalRemark } from "../hooks/use-traits";
import type { StudentResultRemark } from "../types";
import { RemarkField } from "./remark-field";

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
        {currentTerm && (
          <span className="flex items-center gap-1.5 rounded-full border border-n-200 bg-white px-2.5 py-1 text-xs text-n-600">
            <CalendarRange className="size-3.5 shrink-0 text-n-400" />
            {currentTerm.label}
          </span>
        )}
      </div>

      {!canWrite ? (
        <p className="rounded-lg border border-n-200 bg-n-50 px-3.5 py-2.5 text-sm text-n-600">
          Your role doesn&rsquo;t include permission to write principal&rsquo;s remarks. An
          administrator can grant it under Roles &amp; Permissions.
        </p>
      ) : !currentTerm ? (
        <p className="rounded-lg border border-amber/40 bg-amber/10 px-3.5 py-2.5 text-sm text-ink">
          No term is marked current, so there are no report cards to remark on.
        </p>
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
                {students.map((student) => {
                  const remark = byStudent.get(student.id);
                  return (
                    <li key={student.id} className="space-y-3 px-5 py-4">
                      <div>
                        <p className="text-sm font-medium text-ink">
                          {student.user.first_name} {student.user.last_name}
                        </p>
                        <p className="font-mono text-[11px] text-n-400">
                          {student.admission_number}
                        </p>
                      </div>

                      <RemarkField
                        label="Form teacher's remark"
                        placeholder=""
                        saved={remark?.class_teacher_remark}
                        savedByName={
                          remark?.class_teacher_remark_by
                            ? `${remark.class_teacher_remark_by.first_name} ${remark.class_teacher_remark_by.last_name}`
                            : null
                        }
                        savedAt={remark?.class_teacher_remark_at}
                        isPending={false}
                        onSave={() => {}}
                        readOnly
                      />

                      <RemarkField
                        label="Your remark"
                        placeholder="e.g. A commendable result. Keep it up next term."
                        saved={remark?.principal_remark}
                        savedByName={null}
                        savedAt={remark?.principal_remark_at}
                        isPending={setRemark.isPending}
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
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
