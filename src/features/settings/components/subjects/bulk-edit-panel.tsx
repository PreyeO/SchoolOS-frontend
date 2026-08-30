"use client";

import { useMemo, useState } from "react";

import type { SchoolLevelValue } from "@/data/school-levels";
import type { SubjectResponse } from "@/features/onboarding/types";

import { useBulkUpdateSubjects } from "../../hooks/use-bulk-update-subjects";
import {
  buildDrafts,
  collectChanges,
  validateDrafts,
  type DraftMap,
  type SubjectDraft,
} from "../../lib/subject-bulk-edit";
import { BulkEditActions } from "./bulk-edit-actions";
import { BulkEditSaveBar } from "./bulk-edit-save-bar";
import { BulkEditTable } from "./bulk-edit-table";

interface Props {
  // Every active subject, not just the filtered view: edits are kept while the
  // user moves between level tabs, so one save can span several levels.
  editable: SubjectResponse[];
  visible: SubjectResponse[];
  schoolLevels: SchoolLevelValue[];
  onExit: () => void;
}

export function BulkEditPanel({ editable, visible, schoolLevels, onExit }: Props) {
  const [drafts, setDrafts] = useState<DraftMap>(() => buildDrafts(editable));
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const changes = useMemo(() => collectChanges(editable, drafts), [editable, drafts]);
  const errors = useMemo(() => validateDrafts(editable, drafts, editable), [editable, drafts]);
  const changedIds = useMemo(() => new Set(changes.map((c) => c.id)), [changes]);

  const save = useBulkUpdateSubjects(changes.length);

  // A row can be edited on one level tab and then filtered out of sight. Its
  // change still counts and its error still blocks, so both are reported as
  // off-screen rather than leaving the save button dead with no visible cause.
  const visibleIds = new Set(visible.map((s) => s.id));
  const hiddenChanges = changes.filter((c) => !visibleIds.has(c.id)).length;
  const hiddenErrors = Object.keys(errors).filter((id) => !visibleIds.has(id)).length;

  function patchRow(id: string, patch: Partial<SubjectDraft>) {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  }

  function applyToSelected(patch: Partial<SubjectDraft>) {
    setDrafts((prev) => {
      const next = { ...prev };
      for (const id of selected) next[id] = { ...next[id], ...patch };
      return next;
    });
  }

  function toggle(id: string, isSelected: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (isSelected) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  // Scoped to what's on screen — "select all" while filtered to Junior
  // Secondary must not quietly pick up subjects at other levels.
  function toggleAll(isSelected: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const s of visible) {
        if (isSelected) next.add(s.id);
        else next.delete(s.id);
      }
      return next;
    });
  }

  function discard() {
    setDrafts(buildDrafts(editable));
    setSelected(new Set());
    onExit();
  }

  function submit() {
    save.mutate(changes, { onSuccess: onExit });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-n-200 bg-n-50/60 px-3 py-2.5">
        <BulkEditActions
          selectedCount={selected.size}
          schoolLevels={schoolLevels}
          onApply={applyToSelected}
          onClear={() => setSelected(new Set())}
        />
      </div>

      <BulkEditTable
        subjects={visible}
        drafts={drafts}
        schoolLevels={schoolLevels}
        selected={selected}
        changedIds={changedIds}
        errors={errors}
        onToggle={toggle}
        onToggleAll={toggleAll}
        onChange={patchRow}
      />

      <BulkEditSaveBar
        changeCount={changes.length}
        errorCount={Object.keys(errors).length}
        hiddenChanges={hiddenChanges}
        hiddenErrors={hiddenErrors}
        isPending={save.isPending}
        onDiscard={discard}
        onSave={submit}
      />
    </div>
  );
}
