"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SCHOOL_LEVELS, type SchoolLevelValue } from "@/data/school-levels";

interface Props {
  schoolLevels: SchoolLevelValue[];
  // Returns the number of entries actually added (0 if all were duplicates).
  onAdd: (name: string, levels: SchoolLevelValue[]) => number;
}

export function AddSubjectControl({ schoolLevels, onAdd }: Props) {
  const [name, setName] = useState("");
  const [levels, setLevels] = useState<Set<SchoolLevelValue>>(new Set(schoolLevels));
  const options = SCHOOL_LEVELS.filter((l) => schoolLevels.includes(l.value));

  function toggleLevel(value: SchoolLevelValue) {
    setLevels((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  function submit() {
    const added = onAdd(name.trim(), [...levels]);
    if (added > 0) {
      setName("");
      setLevels(new Set(schoolLevels));
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-dashed border-n-300 p-3">
      <p className="text-sm font-medium text-ink">Add a subject</p>
      <div className="flex gap-2">
        <Input
          placeholder="e.g. Arabic, Coding, Quranic Studies"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              submit();
            }
          }}
          className="h-9"
        />
        <Button
          type="button"
          onClick={submit}
          className="h-9 shrink-0 bg-brand text-white hover:bg-brand/90"
        >
          <Plus className="size-4 mr-1" /> Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((l) => (
          <button
            key={l.value}
            type="button"
            onClick={() => toggleLevel(l.value)}
            aria-pressed={levels.has(l.value)}
            className={cn(
              "cursor-pointer rounded-full border px-2.5 py-1 text-xs transition-colors",
              levels.has(l.value)
                ? "border-brand/30 bg-brand/10 text-brand"
                : "border-n-200 text-n-500 hover:border-n-300",
            )}
          >
            {l.label}
          </button>
        ))}
      </div>
    </div>
  );
}
