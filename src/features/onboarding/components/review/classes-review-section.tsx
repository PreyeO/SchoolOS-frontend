import type { ClassResponse } from "../../types";
import { ClassRowReview } from "./class-row-review";
import { AddClassDialog } from "./add-class-dialog";
import { ReviewSectionShell } from "./review-section-shell";

export function ClassesReviewSection({ classes }: { classes: ClassResponse[] }) {
  return (
    <ReviewSectionShell title="Classes">
      {classes.length === 0 ? (
        <p className="text-sm text-n-400 italic">No classes yet.</p>
      ) : (
        <ul className="space-y-2">
          {classes.map((c) => (
            <ClassRowReview key={c.id} klass={c} />
          ))}
        </ul>
      )}
      <AddClassDialog />
    </ReviewSectionShell>
  );
}
