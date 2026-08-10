import { realArms } from "@/lib/school/real-arms";
import type { ClassResponse } from "../../types";

export function ClassesSummary({ classes }: { classes: ClassResponse[] }) {
  if (classes.length === 0) {
    return <p className="text-sm text-n-400 italic">No classes yet.</p>;
  }

  return (
    <ul className="space-y-1.5">
      {classes.map((c) => {
        // A class with no arms of its own still carries the system placeholder
        // arm — listing it here would show the admin a "Default" they never made.
        const arms = realArms(c);
        return (
          <li key={c.id} className="text-sm">
            <span className="font-medium text-ink">{c.name}</span>
            {arms.length > 0 && (
              <span className="text-n-400"> — {arms.map((a) => a.name).join(", ")}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}
