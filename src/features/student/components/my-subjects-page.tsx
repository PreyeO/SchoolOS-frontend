"use client";

import { BookOpen, UserRound } from "lucide-react";

import { ErrorState } from "@/components/shared/error-state";
import { OfflineNotice } from "@/components/shared/offline-notice";
import { useMe } from "@/features/me/hooks/use-me";
import { useArmAssignments } from "@/features/teaching-assignments/hooks/use-arm-assignments";
import { useArmSubjects } from "@/features/teaching-assignments/hooks/use-arm-subjects";
import { armDisplayName } from "@/lib/school/arm-display-name";

import { NotEnrolledNotice } from "./not-enrolled-notice";

// What this student is taught, and by whom.
//
// Both reads are the class-arm detail actions rather than the flat filtered
// lists — the same swap made everywhere else in this codebase, and for the same
// reason: the flat lists require manage_academic_structure while these inherit
// the viewset default of plain school membership. Verified live with a student
// token: GET /class-arms/<arm>/subjects/ and /subject-assignments/ both 200.
//
// The two are joined rather than merged server-side: offerings are what the
// class takes, assignments are which teacher took each one, and a subject can
// be offered with nobody assigned yet. That case shows the subject with the
// teacher line absent, not the subject hidden.
export function MySubjectsPage() {
  const { data: me, isPending: meLoading } = useMe();
  const currentClass = me?.student?.current_class ?? null;
  const armId = currentClass?.class_arm_id ?? null;

  const offerings = useArmSubjects(armId);
  const assignments = useArmAssignments(armId);

  const teacherBySubjectId = new Map(
    (assignments.data ?? []).map((a) => [a.subject.id, a.teacher]),
  );

  if (meLoading) {
    return <p className="text-sm text-n-400" role="status">Loading…</p>;
  }
  if (!currentClass) {
    return <NotEnrolledNotice />;
  }

  const subjects = offerings.data ?? [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">My subjects</h1>
        <p className="mt-1 text-sm text-n-500">
          What{" "}
          {armDisplayName(
            { name: currentClass.arm_name, is_default: currentClass.is_default },
            currentClass.class_name,
          )}{" "}
          is taught this session.
        </p>
      </div>

      {offerings.isPaused && !offerings.data ? (
        <OfflineNotice resourceLabel="Your subjects" />
      ) : offerings.isPending ? (
        <p className="text-sm text-n-400" role="status">Loading subjects…</p>
      ) : offerings.isError ? (
        <ErrorState error={offerings.error} resourceLabel="your subjects" />
      ) : subjects.length === 0 ? (
        <p className="rounded-xl border border-n-200 bg-white p-8 text-center text-sm text-n-400 italic">
          No subjects have been set for your class yet.
        </p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {subjects.map((offering) => {
            const teacher = teacherBySubjectId.get(offering.subject.id);
            return (
              <li
                key={offering.id}
                className="flex items-start gap-3 rounded-xl border border-n-200 bg-white p-4"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <BookOpen className="size-4 text-primary" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">
                    {offering.subject.name}
                  </p>
                  {offering.subject.is_core && (
                    <span className="mt-0.5 inline-block rounded-full bg-n-100 px-1.5 py-0.5 text-[10px] font-medium text-n-500">
                      Core
                    </span>
                  )}
                  {/* Teacher email is deliberately not shown. The endpoint
                      returns it, but a subject list is not a contact directory
                      and a student emailing staff directly isn't a flow this
                      app has decided on. */}
                  <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-n-500">
                    <UserRound className="size-3 shrink-0 text-n-400" />
                    {teacher ? teacher.name : <span className="italic">No teacher assigned</span>}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
