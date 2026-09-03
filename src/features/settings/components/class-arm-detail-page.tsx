"use client";

import Link from "next/link";
import { ArrowLeft, UserRound } from "lucide-react";

import { ErrorState } from "@/components/shared/error-state";
import { PersonAvatar } from "@/components/shared/person-avatar";
import { SCHOOL_LEVELS } from "@/data/school-levels";
import { studentPhoto } from "@/features/students/lib/student-photo";
import { useCanAccess } from "@/lib/auth/use-can-access";
import { armDisplayName } from "@/lib/school/arm-display-name";

import { useClassArmDetail } from "../hooks/use-class-arm-detail";

// One class arm, whole: who teaches it, what it's taught, and who is in it.
//
// Reads the class-arm detail endpoint, which returns all three in a single
// request. Open to any school member — the retrieve action sets no permission
// string — so a class teacher can use it as a roster, not just an admin.
export function ClassArmDetailPage({ armId }: { armId: string }) {
  const { data: arm, isPending, isError, error } = useClassArmDetail(armId);
  const canSeeStudents = useCanAccess("/students");

  if (isPending) {
    return <p className="text-sm text-n-400" role="status">Loading class…</p>;
  }
  if (isError || !arm) {
    return <ErrorState error={error} resourceLabel="this class" />;
  }

  const levelLabel = SCHOOL_LEVELS.find((l) => l.value === arm.level)?.label ?? arm.level;
  const title = armDisplayName({ name: arm.name, is_default: arm.is_default }, arm.class_name);

  return (
    <div className="space-y-6">
      <Link
        href="/classes"
        className="inline-flex items-center gap-1.5 text-sm text-n-500 hover:text-ink"
      >
        <ArrowLeft className="size-4" /> Back to classes
      </Link>

      <div className="rounded-xl border border-n-200 bg-white p-5">
        {/* Class name lives in `title` now (armDisplayName prefixes it for a
            real arm), so repeating it here would read as "Primary 1 A" over
            "Primary 1 · Junior Secondary" — the same name twice. */}
        <h1 className="font-display text-xl font-bold text-ink">{title}</h1>
        <p className="mt-0.5 text-sm text-n-500">{levelLabel}</p>

        <div className="mt-4 flex items-center gap-2.5 border-t border-n-100 pt-4">
          <UserRound className="size-4 shrink-0 text-n-400" />
          {arm.class_teacher ? (
            <p className="text-sm text-ink">
              <span className="text-n-500">Class teacher</span> {arm.class_teacher.name}
            </p>
          ) : (
            // Not cosmetic: without a class teacher this arm's register can't be
            // marked at all, which is the single most consequential gap on the
            // classes screen.
            <p className="text-sm text-clay">
              No class teacher — this arm&rsquo;s register can&rsquo;t be marked until one is
              assigned.
            </p>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-n-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-ink">
          Subjects{" "}
          <span className="font-normal text-n-400">
            {arm.subjects.length === 1 ? "1" : arm.subjects.length}
          </span>
        </h2>
        {arm.subjects.length === 0 ? (
          <p className="text-sm text-n-400 italic">
            No subjects offered yet — scores can&rsquo;t be entered until this arm has some.
          </p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {arm.subjects.map((offering) => (
              <span
                key={offering.id}
                className="rounded-full border border-n-200 bg-n-50 px-2.5 py-1 text-xs text-n-600"
              >
                {offering.subject.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-n-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-ink">
          Students <span className="font-normal text-n-400">{arm.students.length}</span>
        </h2>
        {arm.students.length === 0 ? (
          // The roster resolves against the CURRENT session, so an empty list can
          // equally mean "nobody enrolled" or "no term is marked current" —
          // naming both keeps an admin from hunting the wrong one.
          <p className="text-sm text-n-400 italic">
            Nobody is enrolled in this arm for the current session. If no term is marked
            current, the roster can&rsquo;t resolve at all.
          </p>
        ) : (
          <ul className="divide-y divide-n-100">
            {arm.students.map((student) => (
              <li key={student.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <PersonAvatar
                  firstName={student.user.first_name}
                  lastName={student.user.last_name}
                  photo={studentPhoto(student)}
                  className="size-8 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  {canSeeStudents ? (
                    <Link
                      href={`/students/${student.id}`}
                      className="text-sm text-ink hover:underline"
                    >
                      {student.user.first_name} {student.user.last_name}
                    </Link>
                  ) : (
                    <p className="text-sm text-ink">
                      {student.user.first_name} {student.user.last_name}
                    </p>
                  )}
                  <p className="font-mono text-xs text-n-400">{student.admission_number}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
