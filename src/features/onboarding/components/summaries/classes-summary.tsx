import type { ClassResponse } from "../../types";

export function ClassesSummary({ classes }: { classes: ClassResponse[] }) {
  if (classes.length === 0) {
    return <p className="text-sm text-n-400 italic">No classes yet.</p>;
  }

  return (
    <ul className="space-y-1.5">
      {classes.map((c) => (
        <li key={c.id} className="text-sm">
          <span className="font-medium text-ink">{c.name}</span>
          <span className="text-n-400"> — {c.arms.map((a) => a.name).join(", ")}</span>
        </li>
      ))}
    </ul>
  );
}
