import { cn } from "@/lib/utils";
import { SCHOOL_LEVELS, type SchoolLevelValue } from "@/data/school-levels";
import type { SubjectResponse } from "@/features/onboarding/types";

interface Props {
  schoolLevels: SchoolLevelValue[];
  subjects: SubjectResponse[];
  active: SchoolLevelValue | "all";
  onChange: (level: SchoolLevelValue | "all") => void;
}

export function LevelTabs({ schoolLevels, subjects, active, onChange }: Props) {
  const options = SCHOOL_LEVELS.filter((l) => schoolLevels.includes(l.value));

  function tabClass(isActive: boolean) {
    return cn(
      "cursor-pointer rounded-full border px-3 py-1.5 text-sm transition-colors",
      isActive ? "border-primary bg-primary/10 font-medium text-primary" : "border-n-200 text-n-500 hover:border-n-300",
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      <button type="button" onClick={() => onChange("all")} className={tabClass(active === "all")}>
        All ({subjects.length})
      </button>
      {options.map((l) => (
        <button
          key={l.value}
          type="button"
          onClick={() => onChange(l.value)}
          className={tabClass(active === l.value)}
        >
          {l.label} ({subjects.filter((s) => s.level === l.value).length})
        </button>
      ))}
    </div>
  );
}
