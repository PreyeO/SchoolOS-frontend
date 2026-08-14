import { sortClassesByLevel } from "@/lib/school/class-order";

import type { ClassResponse } from "../../types";
import { ClassRowReview } from "./class-row-review";
import { AddClassDialog } from "./add-class-dialog";
import { ReviewSectionShell } from "./review-section-shell";

export function ClassesReviewSection({ classes }: { classes: ClassResponse[] }) {
  // Rendered straight from the API before this, which meant JSS 1–3 appeared
  // above Nursery and Primary — see sortClassesByLevel for why the server's
  // order can't be trusted here.
  const ordered = sortClassesByLevel(classes);

  return (
    <ReviewSectionShell title="Classes">
      {ordered.length === 0 ? (
        <p className="text-sm text-n-400 italic">No classes yet.</p>
      ) : (
        <ul className="space-y-2">
          {ordered.map((c) => (
            <ClassRowReview key={c.id} klass={c} />
          ))}
        </ul>
      )}
      <AddClassDialog />
    </ReviewSectionShell>
  );
}
