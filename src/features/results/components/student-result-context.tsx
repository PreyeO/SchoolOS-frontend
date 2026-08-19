import Link from "next/link";

import type { BroadsheetColumn, BroadsheetGridRow } from "../hooks/use-broadsheet";

interface Props {
  row: BroadsheetGridRow | undefined;
  columns: BroadsheetColumn[];
}

// A one-line read on the student, above the field where someone remarks on them.
//
// Deliberately not the subject-by-subject breakdown: that's the broadsheet's
// job, it's one click away, and repeating it under all forty students turned
// both remark screens into a wall of chips. What's needed here is enough to
// judge the term at a glance and to know whether the picture is complete.
//
// Total, average and position appear only once the class is published —
// _compute_student_summaries runs at lock time, so before that they don't
// exist. They're also not derivable here: the backend divides the total by the
// number of subjects the arm *offers*, not the number scored, so an average
// worked out from the parts would read high for any student missing a subject
// and contradict the printed card.
export function StudentResultContext({ row, columns }: Props) {
  const scored = columns.filter((c) => row?.bySubject.has(c.subjectId)).length;

  if (!row || scored === 0) {
    return (
      <p className="text-xs text-amber">
        No scores entered for this student yet — there&rsquo;s nothing to base a remark on.
      </p>
    );
  }

  return (
    <p className="text-xs text-n-400">
      <span className={scored < columns.length ? "text-amber" : undefined}>
        {scored} of {columns.length} subject{columns.length === 1 ? "" : "s"} scored
      </span>
      {row.average !== null ? (
        <span className="text-n-600">
          {" · "}
          {row.total} total, {row.average}% average
          {row.position !== null && <>, {row.position} in class</>}
        </span>
      ) : (
        <>
          {" · "}
          <Link href="/results/broadsheet" className="text-primary hover:underline">
            see the breakdown
          </Link>
        </>
      )}
    </p>
  );
}
