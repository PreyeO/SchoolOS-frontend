"use client";

import { ClassesReviewSection } from "@/features/onboarding/components/review/classes-review-section";
import { useClasses } from "../hooks/use-classes";

export function ClassesPage() {
  const { data: classes, isPending, isError } = useClasses();

  if (isPending) {
    return <p className="text-sm text-n-400" role="status">Loading your classes…</p>;
  }

  if (isError) {
    return <p className="text-sm text-clay" role="alert">Couldn&rsquo;t load your classes. Please refresh.</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Classes & Arms</h1>
        <p className="mt-1 text-sm text-n-500">Manage your school&rsquo;s classes and their parallel arms.</p>
      </div>
      <ClassesReviewSection classes={classes} />
    </div>
  );
}
