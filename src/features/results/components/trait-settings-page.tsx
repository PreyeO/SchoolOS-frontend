"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { ErrorState } from "@/components/shared/error-state";
import { SCHOOL_LEVELS } from "@/data/school-levels";
import { useSchoolLevels } from "@/lib/school/use-school-levels";
import { cn } from "@/lib/utils";

import { useCreateTraits, useDeleteTrait, useTraits } from "../hooks/use-traits";
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
    // order is 1-based and must be unique within (level, category), so it
    // continues from whatever is already there rather than restarting.
    const nextOrder = (byCategory.get(category)?.length ?? 0) + 1;
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

          <div className="grid gap-4 lg:grid-cols-2">
            {TRAIT_CATEGORIES.map((category) => {
              const items = byCategory.get(category) ?? [];
              return (
                <section key={category} className="rounded-xl border border-n-200 bg-white p-5">
                  <h2 className="font-display text-base font-semibold text-ink">
                    {CATEGORY_META[category].label}
                  </h2>
                  <p className="mt-0.5 text-xs text-n-400">{CATEGORY_META[category].hint}</p>

                  {items.length === 0 ? (
                    <p className="mt-4 text-sm text-n-400 italic">
                      Nothing here yet — teachers will see no {CATEGORY_META[category].label.toLowerCase()}{" "}
                      section until you add one.
                    </p>
                  ) : (
                    <ul className="mt-3 divide-y divide-n-100">
                      {items.map((trait) => (
                        <li key={trait.id} className="flex items-center gap-3 py-2">
                          <span className="min-w-0 flex-1 truncate text-sm text-ink">
                            {trait.name}
                          </span>
                          <ConfirmDeleteDialog
                            title={`Remove ${trait.name}?`}
                            description="If any student has already been rated on it, it's kept on their past report cards and simply stops appearing for new ones."
                            isPending={deleteTrait.isPending}
                            onConfirm={() => deleteTrait.mutate(trait.id)}
                            trigger={
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label={`Remove ${trait.name}`}
                              >
                                <Trash2 className="size-3.5" />
                              </Button>
                            }
                          />
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-3 flex gap-2">
                    <Input
                      value={drafts[category]}
                      onChange={(e) =>
                        setDrafts((prev) => ({ ...prev, [category]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTrait(category);
                        }
                      }}
                      placeholder={category === "affective" ? "e.g. Punctuality" : "e.g. Handwriting"}
                      aria-label={`New ${CATEGORY_META[category].label} trait`}
                      className="h-9"
                    />
                    <Button
                      type="button"
                      onClick={() => addTrait(category)}
                      disabled={!drafts[category].trim() || createTraits.isPending}
                      className="h-9 shrink-0"
                    >
                      <Plus className="size-4 mr-1" /> Add
                    </Button>
                  </div>
                </section>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
