"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { ArmPicker } from "@/components/shared/arm-picker";
import { ErrorState } from "@/components/shared/error-state";
import { armlessClasses, buildArmOptions } from "@/lib/school/arm-options";
import { useClasses } from "@/features/settings/hooks/use-classes";
import { useSubjects } from "@/features/settings/hooks/use-subjects";
import type { SubjectResponse } from "@/features/onboarding/types";

import { useArmAssignments } from "../hooks/use-arm-assignments";
import { AssignSubjectTeacherDialog } from "./assign-subject-teacher-dialog";
import { SubjectCoverageRow } from "./subject-coverage-row";

export function TeachingAssignmentsPage() {
  const { data: classes, isPending: classesLoading, isError, error } = useClasses();
  const { data: subjects, isPending: subjectsLoading } = useSubjects();
  const [armId, setArmId] = useState<string | null>(null);
  const [assigningSubject, setAssigningSubject] = useState<SubjectResponse | null>(null);

  const groups = useMemo(() => buildArmOptions(classes ?? []), [classes]);
  const allOptions = useMemo(() => groups.flatMap((g) => g.options), [groups]);
  const skipped = useMemo(() => armlessClasses(classes ?? []), [classes]);

  // Default to the first arm once classes land, without an effect.
  const selectedId = armId ?? allOptions[0]?.armId ?? null;
  const selected = allOptions.find((o) => o.armId === selectedId) ?? null;

  const { data: assignments, isPending: assignmentsLoading } = useArmAssignments(selectedId);

  // Only subjects at this arm's level can be assigned — the backend rejects a
  // level mismatch outright, so offering the rest would just produce a 400.
  const levelSubjects = useMemo(
    () => (subjects ?? []).filter((s) => s.level === selected?.level),
    [subjects, selected],
  );

  const bySubject = useMemo(() => {
    const map = new Map<string, typeof assignments>();
    (assignments ?? []).forEach((a) => {
      map.set(a.subject.id, [...(map.get(a.subject.id) ?? []), a]);
    });
    return map;
  }, [assignments]);

  if (classesLoading || subjectsLoading) {
    return <p className="text-sm text-n-400" role="status">Loading classes and subjects…</p>;
  }

  if (isError || !classes) {
    return <ErrorState error={error} resourceLabel="your classes" />;
  }

  const uncovered = levelSubjects.filter((s) => !bySubject.get(s.id)?.length).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Teaching Assignments</h1>
        <p className="mt-1 text-sm text-n-500">
          Set who teaches each subject to each class arm. A teacher can only enter scores
          for subjects they&rsquo;re assigned to.
        </p>
      </div>

      {skipped.length > 0 && (
        <p className="rounded-lg border border-amber/40 bg-amber/10 px-3.5 py-2.5 text-xs text-ink">
          <span className="font-medium">
            {skipped.length} {skipped.length === 1 ? "class isn't" : "classes aren't"} listed below
          </span>{" "}
          — {skipped.map((k) => k.name).join(", ")}{" "}
          {skipped.length === 1 ? "has" : "have"} no arm, so nothing can be assigned to{" "}
          {skipped.length === 1 ? "it" : "them"} yet. Add an arm in{" "}
          <Link href="/classes" className="text-primary hover:underline">
            Classes &amp; Arms
          </Link>{" "}
          to bring {skipped.length === 1 ? "it" : "them"} in.
        </p>
      )}

      {allOptions.length === 0 ? (
        <p className="text-sm text-n-400 italic">
          No classes yet — add one in Classes &amp; Arms first.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <ArmPicker groups={groups} value={selectedId} onChange={setArmId} />
            {!assignmentsLoading && levelSubjects.length > 0 && (
              <p className="text-xs text-n-400">
                {uncovered === 0
                  ? `All ${levelSubjects.length} subjects covered.`
                  : `${uncovered} of ${levelSubjects.length} subjects have no teacher.`}
              </p>
            )}
          </div>

          <div className="rounded-xl border border-n-200 bg-white p-5">
            {levelSubjects.length === 0 ? (
              <p className="text-sm text-n-400 italic">
                No subjects defined for this level yet — add them in Subjects first.
              </p>
            ) : assignmentsLoading ? (
              <p className="text-sm text-n-400" role="status">Loading assignments…</p>
            ) : (
              <ul className="divide-y divide-n-100">
                {levelSubjects.map((subject) => (
                  <SubjectCoverageRow
                    key={subject.id}
                    subject={subject}
                    assignments={bySubject.get(subject.id) ?? []}
                    armLabel={selected?.label ?? ""}
                    onAssign={() => setAssigningSubject(subject)}
                  />
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {assigningSubject && selectedId && (
        <AssignSubjectTeacherDialog
          open={!!assigningSubject}
          onOpenChange={(next) => !next && setAssigningSubject(null)}
          classArmId={selectedId}
          armLabel={selected?.label ?? ""}
          subject={assigningSubject}
          alreadyAssignedIds={(bySubject.get(assigningSubject.id) ?? []).map((a) => a.teacher.id)}
        />
      )}
    </div>
  );
}
