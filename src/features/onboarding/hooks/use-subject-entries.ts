"use client";

import { useState } from "react";
import { toast } from "sonner";

import type { SchoolLevelValue } from "@/data/school-levels";
import type { SubjectTemplatesResponse } from "../types";

export interface SubjectEntry {
  id: string;
  name: string;
  level: SchoolLevelValue;
  is_core: boolean;
  selected: boolean;
}

let idCounter = 0;
const nextId = () => `subj_${idCounter++}`;

// Only these levels have NERDC templates — nursery/creche start empty (add-your-own).
const TEMPLATE_LEVELS = ["primary", "junior_secondary", "senior_secondary"] as const;

export function useSubjectEntries(
  schoolLevels: SchoolLevelValue[],
  templates: SubjectTemplatesResponse | undefined,
  levelsLoading: boolean,
) {
  const [entries, setEntries] = useState<SubjectEntry[]>([]);
  const [seeded, setSeeded] = useState(false);

  // Seed once templates AND the school's levels have both arrived — done
  // during render (not an effect), per React's "adjust state when data
  // arrives" pattern. Levels may need their own fallback fetch (see
  // use-school-levels), so we wait on levelsLoading too, else a school
  // hydrated straight from create-school would seed correctly while
  // one hydrated from a fresh login would seed with zero entries.
  if (templates && !levelsLoading && !seeded) {
    const seededEntries: SubjectEntry[] = [];
    schoolLevels.forEach((level) => {
      if (!(TEMPLATE_LEVELS as readonly string[]).includes(level)) return;
      const items = templates[level as (typeof TEMPLATE_LEVELS)[number]] ?? [];
      items.forEach((item) => {
        seededEntries.push({ id: nextId(), name: item.name, level, is_core: item.is_core, selected: true });
      });
    });
    setEntries(seededEntries);
    setSeeded(true);
  }

  const patch = (id: string, changes: Partial<SubjectEntry>) =>
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, ...changes } : e)));

  const removeEntry = (id: string) => setEntries((prev) => prev.filter((e) => e.id !== id));

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
      .filter((level) => !entries.some((e) => e.level === level && e.name.trim().toLowerCase() === name.toLowerCase()))
      .map((level) => ({ id: nextId(), name, level, is_core: false, selected: true }));
    if (fresh.length === 0) {
      toast.error(`"${name}" already exists for the selected level(s).`);
      return 0;
    }
    setEntries((prev) => [...prev, ...fresh]);
    return fresh.length;
  }

  return { entries, patch, removeEntry, addSubject };
}
