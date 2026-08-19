import type { BroadsheetColumn, BroadsheetGridRow } from "../hooks/use-broadsheet";

interface Props {
  row: BroadsheetGridRow | undefined;
  columns: BroadsheetColumn[];
}

// What a student actually scored, shown beside the field where someone writes
// their remark.
//
// Both remarks on a report card are about the term's *result*, so writing one
// without the result in view means commenting blind — which is what happened
// before this existed: the form teacher wrote theirs next to behaviour ratings,
// and the principal then responded to that comment with nothing in front of
// them either.
//
// Position and average are deliberately absent until the class is published:
// _compute_student_summaries only runs at lock time, so before then they don't
// exist. Nor are they derivable here — the backend divides the total by the
// number of subjects the arm *offers*, not the number scored, so an average
// computed from these chips would read high for any student missing a subject
// and contradict the printed card.
export function StudentResultContext({ row, columns }: Props) {
  const scored = columns.filter((c) => row?.bySubject.has(c.subjectId));

  if (!row || scored.length === 0) {
    return (
      <p className="text-xs text-amber">
        No scores entered for this student yet — there&rsquo;s nothing to base a remark on.
      </p>
    );
  }

  return (
    <div className="space-y-1.5">
      <ul className="flex flex-wrap gap-1.5">
        {scored.map((column) => {
          const result = row.bySubject.get(column.subjectId)!;
          return (
            <li
              key={column.subjectId}
              className="rounded-full border border-n-200 px-2.5 py-1 text-xs text-n-600"
            >
              {column.name}{" "}
              <span className="font-medium tabular-nums text-ink">
                {Number(result.total_score)}
              </span>
              {result.grade && <span className="ml-1 text-n-400">{result.grade}</span>}
            </li>
          );
        })}
      </ul>

      <p className="text-xs text-n-400">
        {scored.length} of {columns.length} subject{columns.length === 1 ? "" : "s"} scored
        {row.average !== null && (
          <>
            {" · "}
            <span className="text-n-600">
              {row.total} total, {row.average}% average
            </span>
            {row.position !== null && <span className="text-n-600">, {row.position} in class</span>}
          </>
        )}
      </p>
    </div>
  );
}
