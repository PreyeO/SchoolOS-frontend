"use client";

import { useState } from "react";
import { Users2 } from "lucide-react";

import { ErrorState } from "@/components/shared/error-state";
import { OfflineNotice } from "@/components/shared/offline-notice";
import { Select } from "@/components/ui/select";
import { StudentsTable } from "@/features/students/components/students-table";
import { useStudents } from "@/features/students/hooks/use-students";

import { useMyClasses } from "../hooks/use-my-classes";

// The students a teacher is actually responsible for.
//
// Deliberately scoped to their own arms rather than opening the school-wide
// directory. CanViewStudents would allow the latter — any teacher may read any
// student at their school, which is how the detail page works at all — but a
// roster carries medical data (allergies, blood group, emergency medication),
// and "every child in the school" is a wider surface than a teacher needs to
// answer "who is in my class". The arms come from /me, so the scoping costs
// nothing extra.
//
// Rosters are read per arm via ?class_arm_id=, which resolves server-side to
// each student's latest enrolment for the current session — so a mid-session
// transfer shows up under the arm they're in now.
export function MyStudentsPage() {
  const { classes, isPending: classesLoading, unavailableOffline, isError, error } = useMyClasses();
  const [armId, setArmId] = useState<string | null>(null);

  // Form classes first (useMyClasses already orders them that way), so a form
  // teacher lands on their own class rather than whichever arm sorted first.
  const selectedArmId = armId ?? classes[0]?.classArmId ?? null;
  const selected = classes.find((c) => c.classArmId === selectedArmId) ?? null;

  const roster = useStudents(
    selectedArmId ? { class_arm_id: selectedArmId, page_size: 100 } : {},
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">My Students</h1>
        <p className="mt-1 text-sm text-n-500">
          Everyone in the classes you teach or lead. Open a student for their
          medical and personal details.
        </p>
      </div>

      {unavailableOffline ? (
        <OfflineNotice resourceLabel="Your classes" />
      ) : isError ? (
        <ErrorState error={error} resourceLabel="your classes" />
      ) : classesLoading ? (
        <p className="text-sm text-n-400" role="status">Loading your classes…</p>
      ) : classes.length === 0 ? (
        <div className="rounded-xl border border-n-200 bg-white p-8 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-n-100">
            <Users2 className="size-5 text-n-400" />
          </div>
          <h2 className="mt-4 font-display text-lg font-semibold text-ink">
            No classes assigned yet
          </h2>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-n-500">
            Once an administrator makes you a class teacher or assigns you a
            subject, your students appear here.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-end gap-3">
            <label className="space-y-1.5">
              <span className="block text-sm font-medium text-ink">Class</span>
              <Select
                value={selectedArmId ?? ""}
                onChange={(e) => setArmId(e.target.value)}
                className="min-w-52"
              >
                {classes.map((klass) => (
                  <option key={klass.classArmId} value={klass.classArmId}>
                    {klass.label}
                    {klass.isFormClass ? " — form class" : ""}
                  </option>
                ))}
              </Select>
            </label>
            {roster.data && (
              <p className="pb-2 text-xs text-n-500">
                {roster.data.count} student{roster.data.count === 1 ? "" : "s"} in{" "}
                {selected?.label}
              </p>
            )}
          </div>

          {roster.isPaused && !roster.data ? (
            <OfflineNotice resourceLabel="This roster" />
          ) : roster.isPending ? (
            <p className="text-sm text-n-400" role="status">Loading students…</p>
          ) : roster.isError ? (
            <ErrorState error={roster.error} resourceLabel="this roster" />
          ) : (
            <StudentsTable students={roster.data.results} basePath="/my-students" />
          )}
        </>
      )}
    </div>
  );
}
