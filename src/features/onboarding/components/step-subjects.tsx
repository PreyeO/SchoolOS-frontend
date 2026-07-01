"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useSchoolStore } from "@/stores/school-store";
import { SCHOOL_LEVELS, type SchoolLevelValue } from "@/data/school-levels";
import { getSuggestedSubjects } from "@/data/nerdc-subjects";

import { subjectsSchema } from "../schemas/subjects-schema";
import { useCreateSubjects } from "../hooks/use-create-subjects";
import { SubjectRow } from "./subject-row";
import { AddSubjectControl } from "./add-subject-control";

interface SubjectEntry {
  id: string;
  name: string;
  level: SchoolLevelValue;
  is_core: boolean;
  selected: boolean;
}

let idCounter = 0;
const nextId = () => `subj_${idCounter++}`;

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function StepSubjects({ onNext, onBack }: Props) {
  const levels = useSchoolStore((s) => s.currentSchool?.levels);
  const { mutate, isPending } = useCreateSubjects();
  const schoolLevels = (levels ?? []) as SchoolLevelValue[];

  const [entries, setEntries] = useState<SubjectEntry[]>(() =>
    getSuggestedSubjects(schoolLevels).map((s) => ({ ...s, id: nextId(), selected: true })),
  );

  const selectedCount = entries.filter((e) => e.selected).length;

  const patch = (id: string, changes: Partial<SubjectEntry>) =>
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...changes } : e)));

  function addSubject(name: string, addLevels: SchoolLevelValue[]): number {
    if (!name) {
      toast.error("Enter a subject name.");
      return 0;
    }
    if (addLevels.length === 0) {
      toast.error("Pick at least one level.");
      return 0;
    }
    const fresh = addLevels
      .filter(
        (level) =>
          !entries.some(
            (e) => e.level === level && e.name.trim().toLowerCase() === name.toLowerCase(),
          ),
      )
      .map((level) => ({ id: nextId(), name, level, is_core: false, selected: true }));
    if (fresh.length === 0) {
      toast.error(`"${name}" already exists for the selected level(s).`);
      return 0;
    }
    setEntries((prev) => [...prev, ...fresh]);
    return fresh.length;
  }

  function submit() {
    const subjects = entries
      .filter((e) => e.selected)
      .map((e) => ({ name: e.name.trim(), level: e.level, is_core: e.is_core }));
    const parsed = subjectsSchema.safeParse({ subjects });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please review your subjects.");
      return;
    }
    mutate({ subjects: parsed.data.subjects }, { onSuccess: onNext });
  }

  const groups = SCHOOL_LEVELS.filter((l) => schoolLevels.includes(l.value)).map((l) => ({
    level: l,
    items: entries.filter((e) => e.level === l.value),
  }));

  return (
    <div className="space-y-5">
      <p className="text-sm text-n-500">
        Pre-selected NERDC subjects per level. Uncheck to skip, rename inline, or add your own.
        <span className="ml-1 text-ink font-medium">{selectedCount} selected.</span>
      </p>

      <div className="max-h-80 space-y-4 overflow-y-auto pr-1">
        {groups.map(({ level, items }) => (
          <div key={level.value} className="space-y-2">
            <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-n-400">
              {level.label}
            </p>
            {items.length === 0 ? (
              <p className="text-xs text-n-400 italic">No subjects yet — add one below.</p>
            ) : (
              items.map((entry) => (
                <SubjectRow
                  key={entry.id}
                  entry={entry}
                  onToggle={() => patch(entry.id, { selected: !entry.selected })}
                  onRename={(name) => patch(entry.id, { name })}
                  onToggleCore={() => patch(entry.id, { is_core: !entry.is_core })}
                  onRemove={() => setEntries((prev) => prev.filter((e) => e.id !== entry.id))}
                />
              ))
            )}
          </div>
        ))}
      </div>

      <AddSubjectControl schoolLevels={schoolLevels} onAdd={addSubject} />

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="outline" onClick={onBack}>Back</Button>
        <Button
          type="button"
          onClick={submit}
          disabled={isPending}
          className="flex-1 bg-amber hover:bg-amber/90 text-ink font-semibold"
        >
          {isPending ? "Saving…" : `Save ${selectedCount} subject${selectedCount !== 1 ? "s" : ""}`}
        </Button>
      </div>
    </div>
  );
}
