"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SCHOOL_LEVELS } from "@/data/school-levels";
import { useSchoolLevels } from "@/lib/school/use-school-levels";
import { AddClassDialog } from "@/features/onboarding/components/review/add-class-dialog";
import { ClassRowReview } from "@/features/onboarding/components/review/class-row-review";

import { useClasses } from "../hooks/use-classes";

export function ClassesPage() {
  const { data: classes, isPending, isError } = useClasses();
  const { levels: schoolLevels } = useSchoolLevels();

  if (isPending) {
    return <p className="text-sm text-n-400" role="status">Loading your classes…</p>;
  }

  if (isError || !classes) {
    return <p className="text-sm text-clay" role="alert">Couldn&rsquo;t load your classes. Please refresh.</p>;
  }

  const groups = SCHOOL_LEVELS.filter((l) => schoolLevels.includes(l.value))
    .map((l) => ({
      level: l,
      items: classes.filter((c) => c.level === l.value).sort((a, b) => a.order - b.order),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Classes & Arms</h1>
          <p className="mt-1 text-sm text-n-500">Manage your school&rsquo;s classes and their parallel arms.</p>
        </div>
        <AddClassDialog
          trigger={
            <Button type="button">
              <Plus className="size-4 mr-1" /> Add class
            </Button>
          }
        />
      </div>

      {groups.length === 0 ? (
        <p className="text-sm text-n-400 italic">No classes yet.</p>
      ) : (
        <div className="space-y-5">
          {groups.map(({ level, items }) => (
            <div key={level.value}>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.15em] text-n-400">{level.label}</p>
              <ul className="space-y-2">
                {items.map((klass) => (
                  <ClassRowReview key={klass.id} klass={klass} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
