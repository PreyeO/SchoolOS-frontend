"use client";

import { Check, Plus, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/error-state";
import { SCHOOL_LEVELS } from "@/data/school-levels";
import { realArms } from "@/lib/school/real-arms";
import { useSchoolLevels } from "@/lib/school/use-school-levels";
import { AddClassDialog } from "@/features/onboarding/components/review/add-class-dialog";
import { ClassRowReview } from "@/features/onboarding/components/review/class-row-review";

import { useClasses } from "../hooks/use-classes";

export function ClassesPage() {
  const { data: classes, isPending, isError, error } = useClasses();
  const { levels: schoolLevels } = useSchoolLevels();

  if (isPending) {
    return <p className="text-sm text-n-400" role="status">Loading your classes…</p>;
  }

  if (isError || !classes) {
    return <ErrorState error={error} resourceLabel="your classes" />;
  }

  const groups = SCHOOL_LEVELS.filter((l) => schoolLevels.includes(l.value))
    .map((l) => ({
      level: l,
      items: classes.filter((c) => c.level === l.value).sort((a, b) => a.order - b.order),
    }))
    .filter((g) => g.items.length > 0);

  // Counted across every level, not per level — an arm with no class teacher
  // can't have its register marked at all, and that's the one thing on this page
  // you shouldn't have to scroll the whole list to discover.
  //
  // Includes the system placeholder arm: a class with no arms of its own still
  // holds its class teacher there, so leaving it out would under-report gaps.
  const allArms = classes.flatMap((c) => c.arms);
  const withoutTeacher = allArms.filter((a) => !a.class_teacher).length;
  const armlessClassCount = classes.filter((c) => c.arms.length === 0).length;

  // Nobody has named an arm yet. That's a perfectly finished school, not a gap —
  // but the page is called "Classes & Arms" and every row offers "Add arm", so
  // an admin can reasonably wonder whether they've missed a step. Said once,
  // here, and only while the question can arise.
  const noNamedArms = classes.length > 0 && !classes.some((c) => realArms(c).length > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Classes & Arms</h1>
          <p className="mt-1 text-sm text-n-500">Manage your school&rsquo;s classes and their parallel arms.</p>
          {allArms.length > 0 && (
            <p className="mt-1.5 flex items-center gap-1.5 text-sm">
              {withoutTeacher === 0 ? (
                <>
                  <Check className="size-3.5 shrink-0 text-emerald-600" />
                  <span className="text-n-500">
                    All {allArms.length} {allArms.length === 1 ? "class has" : "classes have"} a
                    form teacher.
                  </span>
                </>
              ) : (
                <>
                  <TriangleAlert className="size-3.5 shrink-0 text-amber" />
                  <span className="text-ink">
                    {withoutTeacher} of {allArms.length}{" "}
                    {allArms.length === 1 ? "class has" : "classes have"} no form teacher
                  </span>
                  <span className="text-n-400">— their registers can&rsquo;t be marked.</span>
                </>
              )}
            </p>
          )}
        </div>
        <AddClassDialog
          trigger={
            <Button type="button">
              <Plus className="size-4 mr-1" /> Add class
            </Button>
          }
        />
      </div>

      {/* Pre-placeholder rows that hold no arm at all. They can't take a form
          teacher, an enrolment or attendance, and they're invisible in the count
          above because they contribute no arms — so they're named separately. */}
      {armlessClassCount > 0 && (
        <p className="rounded-lg border border-amber/40 bg-amber/10 px-3.5 py-2.5 text-xs text-ink">
          {armlessClassCount} {armlessClassCount === 1 ? "class has" : "classes have"} no arm at
          all. Until you add one, {armlessClassCount === 1 ? "it" : "they"} can&rsquo;t take a
          form teacher, an enrolment or attendance.
        </p>
      )}

      {/* Deliberately neutral, not amber: this is information, not a warning. */}
      {noNamedArms && (
        <p className="rounded-lg border border-n-200 bg-n-50 px-3.5 py-2.5 text-xs text-n-600">
          <span className="font-medium text-ink">Arms are optional.</span> Add one only if a
          class runs parallel streams — Primary 1 A and Primary 1 B, taught separately. If each
          class is a single group, you&rsquo;re already set up: enrolment, attendance and
          teaching all work as they are.
        </p>
      )}

      {groups.length === 0 ? (
        <p className="text-sm text-n-400 italic">No classes yet.</p>
      ) : (
        <div className="space-y-5">
          {groups.map(({ level, items }) => (
            <div key={level.value}>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.15em] text-n-400">{level.label}</p>
              <ul className="space-y-2">
                {items.map((klass) => (
                  <ClassRowReview key={klass.id} klass={klass} linkArms />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
