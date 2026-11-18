// Which assessments (CA 1, CA 2, Exam…) still have students without a saved
// score, for the warning before a teacher submits.
//
// Why it matters: one submission covers the whole subject for the term, every
// component in it. Once an admin approves, the backend refuses every further
// score write for that subject (bulk_enter_scores: "already been approved and
// is locked from editing"), so a column left empty at submission stays empty
// until an admin unlocks it. Teachers were submitting after CA 1 as if each
// assessment were approved on its own.

export interface ComponentGap {
  id: string;
  name: string;
  entered: number;
  total: number;
}

export function findIncompleteComponents(
  components: Array<{ id: string; name: string }>,
  enteredByComponent: Map<string, number>,
  studentCount: number,
): ComponentGap[] {
  if (studentCount === 0) return [];
  return components
    .map((c) => ({
      id: c.id,
      name: c.name,
      // Clamped: a score saved for a student who has since left the arm still
      // counts in the saved total, and "36 of 35" would read as an error.
      entered: Math.min(enteredByComponent.get(c.id) ?? 0, studentCount),
      total: studentCount,
    }))
    .filter((gap) => gap.entered < gap.total);
}
