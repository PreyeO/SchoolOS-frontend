"use client";

import { useMemo, useState } from "react";

import { ErrorState } from "@/components/shared/error-state";
import { SCHOOL_LEVELS } from "@/data/school-levels";
import { useSchoolLevels } from "@/lib/school/use-school-levels";
import { cn } from "@/lib/utils";

import { useCreateTraits, useDeleteTrait, useTraits } from "../hooks/use-traits";
import { TraitCategoryCard } from "./trait-category-card";
import { TRAIT_CATEGORIES, type BehavioralTrait, type TraitCategory } from "../types";

const CATEGORY_META: Record<TraitCategory, { label: string; hint: string }> = {
  affective: {
    label: "Affective",
    hint: "Attitude and conduct — punctuality, neatness, politeness.",
  },
  psychomotor: {
    label: "Psychomotor",
    hint: "Practical and physical skill — handwriting, sports, craft.",
  },
};

export function TraitSettingsPage() {
  const { levels: schoolLevels, isLoading: levelsLoading } = useSchoolLevels();
  const { data: traits, isPending, isError, error } = useTraits();
  const createTraits = useCreateTraits();
  const deleteTrait = useDeleteTrait();

  const [level, setLevel] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<TraitCategory, string>>({
    affective: "",
    psychomotor: "",
  });

  const levelOptions = useMemo(
    () => SCHOOL_LEVELS.filter((l) => schoolLevels.includes(l.value)),
    [schoolLevels],
  );
  const activeLevel = level ?? levelOptions[0]?.value ?? null;

  // Deactivated traits are deliberately hidden. The backend keeps them so past
  // report cards retain their wording, but they're history — showing them here
  // would invite an admin to "fix" a row that no longer applies to anyone.
  const byCategory = useMemo(() => {
    const map = new Map<TraitCategory, BehavioralTrait[]>();
    TRAIT_CATEGORIES.forEach((c) => {
      map.set(
        c,
        (traits ?? [])
          .filter((t) => t.is_active && t.level === activeLevel && t.category === c)
          .sort((a, b) => a.order - b.order),
      );
    });
    return map;
  }, [traits, activeLevel]);

  function addTrait(category: TraitCategory) {
    const name = drafts[category].trim();
    if (!name || !activeLevel) return;
    // order must be unique within (level, category) — but only among ACTIVE
    // traits; the backend validates against those, not the full history. This
    // has to be the highest existing order plus one, not a count of how many
    // active traits there are: deactivating one (see TraitCategoryCard's own
    // comment — the backend deactivates rather than deletes once a trait has
    // ratings) leaves a gap in the numbering without shrinking anyone else's
    // order, so counting active rows undercounts and reissues an order a
    // still-active trait already holds. Same shape as session-card.tsx's
    // nextOrder for adding a period to an existing session.
    const existingOrders = (byCategory.get(category) ?? []).map((t) => t.order);
    const nextOrder = Math.max(0, ...existingOrders) + 1;
    createTraits.mutate(
      { level: activeLevel, category, traits: [{ name, order: nextOrder }] },
      { onSuccess: () => setDrafts((prev) => ({ ...prev, [category]: "" })) },
    );
  }

  if (isPending || levelsLoading) {
    return <p className="text-sm text-n-400" role="status">Loading traits…</p>;
  }

  if (isError) {
    return <ErrorState error={error} resourceLabel="behaviour traits" />;
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Behaviour traits</h1>
        <p className="mt-1 text-sm text-n-500">
          What form teachers rate each student on, 1&ndash;5, for the report card. Set per level,
          because what you expect of a Primary 1 pupil isn&rsquo;t what you expect of an SSS 3
          student.
        </p>
      </div>

      {levelOptions.length === 0 ? (
        <p className="text-sm text-n-400 italic">No levels are set up for this school yet.</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5">
            {levelOptions.map((l) => (
              <button
                key={l.value}
                type="button"
                onClick={() => setLevel(l.value)}
                aria-pressed={activeLevel === l.value}
                className={cn(
                  "cursor-pointer rounded-full border px-3 py-1.5 text-sm transition-colors",
                  activeLevel === l.value
                    ? "border-primary bg-primary/10 font-medium text-primary"
                    : "border-n-200 text-n-500 hover:border-n-300",
                )}
              >
                {l.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {TRAIT_CATEGORIES.map((category) => (
              <TraitCategoryCard
                key={category}
                label={CATEGORY_META[category].label}
                hint={CATEGORY_META[category].hint}
                traits={byCategory.get(category) ?? []}
                draft={drafts[category]}
                onDraftChange={(value) => setDrafts((prev) => ({ ...prev, [category]: value }))}
                onAdd={() => addTrait(category)}
                onDelete={(id) => deleteTrait.mutate(id)}
                isAdding={createTraits.isPending}
                isDeleting={deleteTrait.isPending}
                placeholder={category === "affective" ? "e.g. Punctuality" : "e.g. Handwriting"}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
