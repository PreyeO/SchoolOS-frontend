"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useSchoolStore } from "@/stores/school-store";
import { SCHOOL_LEVELS, type SchoolLevelValue } from "@/data/school-levels";
import type { StepKey } from "@/lib/school/onboarding-steps";

import { subjectsSchema } from "../schemas/subjects-schema";
import { useCreateSubjects } from "../hooks/use-create-subjects";
import { useSubjectTemplates } from "../hooks/use-subject-templates";
import { useSubjectEntries } from "../hooks/use-subject-entries";
import { SubjectRow } from "./subject-row";
import { AddSubjectControl } from "./add-subject-control";
import { PrefillNotice } from "./prefill-notice";

interface Props {
  onAdvanced: (step: StepKey) => void;
  onBack: () => void;
}

export function StepSubjects({ onAdvanced, onBack }: Props) {
  const levels = useSchoolStore((s) => s.currentSchool?.levels);
  const schoolLevels = (levels ?? []) as SchoolLevelValue[];
  const { data: templates, isPending: templatesLoading } = useSubjectTemplates();
  const { save, isSaving, skip, isSkipping } = useCreateSubjects(onAdvanced);
  const { entries, patch, removeEntry, addSubject } = useSubjectEntries(schoolLevels, templates);

  const selectedCount = entries.filter((e) => e.selected).length;
  const pending = isSaving || isSkipping;

  function submit() {
    const subjects = entries.filter((e) => e.selected).map((e) => ({ name: e.name.trim(), level: e.level, is_core: e.is_core }));
    const parsed = subjectsSchema.safeParse({ subjects });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please review your subjects.");
      return;
    }
    save({ subjects: parsed.data.subjects });
  }

  const groups = SCHOOL_LEVELS.filter((l) => schoolLevels.includes(l.value)).map((l) => ({
    level: l,
    items: entries.filter((e) => e.level === l.value),
  }));

  return (
    <div className="space-y-5">
      <p className="text-sm text-n-500">
        {templatesLoading
          ? "Loading subject suggestions…"
          : "Pre-selected subjects per level. Uncheck to skip, rename inline, or add your own."}
        {!templatesLoading && <span className="ml-1 text-ink font-medium">{selectedCount} selected.</span>}
      </p>

      <PrefillNotice>
        These subjects are suggested based on your school&rsquo;s levels — please
        crosscheck them against what you actually teach. Everything here is editable.
      </PrefillNotice>

      <p aria-live="polite" className="sr-only">{selectedCount} subjects selected</p>

      <div className="max-h-80 space-y-4 overflow-y-auto pr-1">
        {groups.map(({ level, items }) => (
          <div key={level.value} className="space-y-2">
            <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-n-400">{level.label}</p>
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
                  onRemove={() => removeEntry(entry.id)}
                />
              ))
            )}
          </div>
        ))}
      </div>

      <AddSubjectControl schoolLevels={schoolLevels} onAdd={addSubject} />

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="outline" onClick={onBack}>Back</Button>
        <Button type="button" variant="ghost" onClick={() => skip()} disabled={pending}>
          {isSkipping ? "Skipping…" : "Skip"}
        </Button>
        <Button
          type="button"
          onClick={submit}
          disabled={pending}
          className="flex-1 bg-amber hover:bg-amber/90 text-ink font-semibold"
        >
          {isSaving ? "Saving…" : `Save ${selectedCount} subject${selectedCount !== 1 ? "s" : ""}`}
        </Button>
      </div>
    </div>
  );
}
