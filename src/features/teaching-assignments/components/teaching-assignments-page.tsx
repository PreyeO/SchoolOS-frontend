"use client";

import { useMemo, useState } from "react";

import { ArmPicker } from "@/components/shared/arm-picker";
import { ErrorState } from "@/components/shared/error-state";
import { armlessClasses, buildArmOptions } from "@/lib/school/arm-options";
import { useClasses } from "@/features/settings/hooks/use-classes";
import { useSubjects } from "@/features/settings/hooks/use-subjects";
import { isActiveSubject } from "@/lib/school/active-subject";
import type { SubjectResponse } from "@/features/onboarding/types";

import { useArmAssignments } from "../hooks/use-arm-assignments";
import type { SubjectAssignment } from "../types";
import { useArmSubjects } from "../hooks/use-arm-subjects";
import { ArmlessClassesNotice } from "./armless-classes-notice";
import { AssignSubjectTeacherDialog } from "./assign-subject-teacher-dialog";
import { OfferSubjectsDialog } from "./offer-subjects-dialog";
import { SubjectCoverageList } from "./subject-coverage-list";

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

  const { data: offerings, isPending: offeringsLoading } = useArmSubjects(selectedId);

  // Only subjects at this arm's level can be offered — the backend rejects a
  // level mismatch outright, so listing the rest would just produce a 400.
  //
  // Deactivated subjects are excluded for the same reason: POST
  // /class-arm-subjects/ refuses them as "Subject(s) not found in this school".
  // They stay visible on the Subjects management screen, just not offerable.
  const levelSubjects = useMemo(
    () =>
      (subjects ?? []).filter((s) => s.level === selected?.level && isActiveSubject(s)),
    [subjects, selected],
  );

  // The arm's own subject list, not every subject at its level. Arms under one
  // class diverge by track, and a teacher can only be assigned to a subject the
  // arm actually offers.
  const offeredSubjects = useMemo(
    () => (offerings ?? []).map((o) => o.subject),
    [offerings],
  );
  const offeringIdBySubject = useMemo(() => {
    const map = new Map<string, string>();
    (offerings ?? []).forEach((o) => map.set(o.subject.id, o.id));
    return map;
  }, [offerings]);
  const available = useMemo(
    () => levelSubjects.filter((s) => !offeringIdBySubject.has(s.id)),
    [levelSubjects, offeringIdBySubject],
  );

  // Explicitly typed rather than inferred from `assignments`, which is
  // `SubjectAssignment[] | undefined` while the query is in flight — the map's
  // values are always a real array here, and inheriting the undefined leaked
  // into every consumer's signature.
  const bySubject = useMemo(() => {
    const map = new Map<string, SubjectAssignment[]>();
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

  const loading = assignmentsLoading || offeringsLoading;
  const uncovered = offeredSubjects.filter((s) => !bySubject.get(s.id)?.length).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Teaching Assignments</h1>
        <p className="mt-1 text-sm text-n-500">
          Set who teaches each subject to each class arm. A teacher can only enter scores
          for subjects they&rsquo;re assigned to.
        </p>
      </div>

      <ArmlessClassesNotice classes={skipped} />

      {allOptions.length === 0 ? (
        <p className="text-sm text-n-400 italic">
          No classes yet — add one in Classes &amp; Arms first.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <ArmPicker groups={groups} value={selectedId} onChange={setArmId} />
            <div className="flex items-center gap-3">
              {!loading && offeredSubjects.length > 0 && (
                <p className="text-xs text-n-400">
                  {uncovered === 0
                    ? `All ${offeredSubjects.length} subjects covered.`
                    : `${uncovered} of ${offeredSubjects.length} subjects have no teacher.`}
                </p>
              )}
              {selectedId && (
                <OfferSubjectsDialog
                  classArmId={selectedId}
                  armLabel={selected?.label ?? ""}
                  available={available}
                />
              )}
            </div>
          </div>

          <SubjectCoverageList
            loading={loading}
            armLabel={selected?.label ?? ""}
            levelSubjects={levelSubjects}
            offeredSubjects={offeredSubjects}
            bySubject={bySubject}
            offeringIdBySubject={offeringIdBySubject}
            onAssign={setAssigningSubject}
          />
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
          armSubjects={offeredSubjects}
          armAssignments={assignments ?? []}
        />
      )}
    </div>
  );
}
