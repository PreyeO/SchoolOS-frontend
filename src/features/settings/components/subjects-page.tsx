"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorState } from "@/components/shared/error-state";
import { isActiveSubject } from "@/lib/school/active-subject";
import { useSchoolLevels } from "@/lib/school/use-school-levels";
import type { SchoolLevelValue } from "@/data/school-levels";

import { useSubjects } from "../hooks/use-subjects";
import { AddSubjectDialog } from "./subjects/add-subject-dialog";
import { BulkEditPanel } from "./subjects/bulk-edit-panel";
import { LevelTabs } from "./subjects/level-tabs";
import { SubjectsTable } from "./subjects/subjects-table";

export function SubjectsPage() {
  const { data: subjects, isPending, isError, error } = useSubjects();
  const { levels: schoolLevels } = useSchoolLevels();
  const [activeLevel, setActiveLevel] = useState<SchoolLevelValue | "all">("all");
  const [query, setQuery] = useState("");
  const [bulkEditing, setBulkEditing] = useState(false);

  const filtered = useMemo(() => {
    if (!subjects) return [];
    const q = query.trim().toLowerCase();
    return subjects.filter((s) => {
      const matchesLevel = activeLevel === "all" || s.level === activeLevel;
      const matchesQuery = !q || s.name.toLowerCase().includes(q);
      return matchesLevel && matchesQuery;
    });
  }, [subjects, activeLevel, query]);

  if (isPending) {
    return <p className="text-sm text-n-400" role="status">Loading your subjects…</p>;
  }

  if (isError || !subjects) {
    return <ErrorState error={error} resourceLabel="your subjects" />;
  }

  // A deactivated subject can't be bulk-updated — the endpoint looks up active
  // rows only and rejects the whole (atomic) call if any id misses. They stay
  // visible in the read-only table, which is where they're useful as context.
  const editable = subjects.filter(isActiveSubject);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Subjects</h1>
          <p className="mt-1 text-sm text-n-500">
            {bulkEditing
              ? "Edit any field directly, or select rows to change them together."
              : "Manage the subjects taught at each level."}
          </p>
        </div>
        {!bulkEditing && (
          <span className="flex items-center gap-2">
            {editable.length > 1 && (
              <Button type="button" variant="outline" onClick={() => setBulkEditing(true)}>
                Bulk edit
              </Button>
            )}
            <AddSubjectDialog schoolLevels={schoolLevels} existingSubjects={subjects} />
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <LevelTabs schoolLevels={schoolLevels} subjects={subjects} active={activeLevel} onChange={setActiveLevel} />
        <Input
          placeholder="Search subjects…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="ml-auto h-9 max-w-xs"
        />
      </div>

      {bulkEditing ? (
        <BulkEditPanel
          editable={editable}
          visible={filtered.filter(isActiveSubject)}
          schoolLevels={schoolLevels}
          onExit={() => setBulkEditing(false)}
        />
      ) : (
        <SubjectsTable subjects={filtered} schoolLevels={schoolLevels} />
      )}
    </div>
  );
}
