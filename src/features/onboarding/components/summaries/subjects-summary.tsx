import { SCHOOL_LEVELS } from "@/data/school-levels";
import type { SubjectResponse } from "../../types";

export function SubjectsSummary({ subjects }: { subjects: SubjectResponse[] }) {
  const groups = SCHOOL_LEVELS.map((l) => ({
    level: l,
    items: subjects.filter((s) => s.level === l.value),
  })).filter((g) => g.items.length > 0);

  if (groups.length === 0) {
    return <p className="text-sm text-n-400 italic">No subjects yet.</p>;
  }

  return (
    <div className="space-y-3">
      {groups.map(({ level, items }) => (
        <div key={level.value}>
          <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-n-400 mb-1">{level.label}</p>
          <p className="text-sm text-ink">{items.map((s) => s.name).join(", ")}</p>
        </div>
      ))}
    </div>
  );
}
