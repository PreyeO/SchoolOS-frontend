"use client";

import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { useSchoolLevels } from "@/lib/school/use-school-levels";
import type { SchoolLevelValue } from "@/data/school-levels";

import { useSubjects } from "../hooks/use-subjects";
import { AddSubjectDialog } from "./subjects/add-subject-dialog";
import { LevelTabs } from "./subjects/level-tabs";
import { SubjectsTable } from "./subjects/subjects-table";

export function SubjectsPage() {
  const { data: subjects, isPending, isError } = useSubjects();
  const { levels: schoolLevels } = useSchoolLevels();
  const [activeLevel, setActiveLevel] = useState<SchoolLevelValue | "all">("all");
  const [query, setQuery] = useState("");

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
    return <p className="text-sm text-clay" role="alert">Couldn&rsquo;t load your subjects. Please refresh.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Subjects</h1>
          <p className="mt-1 text-sm text-n-500">Manage the subjects taught at each level.</p>
        </div>
        <AddSubjectDialog schoolLevels={schoolLevels} existingSubjects={subjects} />
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

      <SubjectsTable subjects={filtered} schoolLevels={schoolLevels} />
    </div>
  );
}
