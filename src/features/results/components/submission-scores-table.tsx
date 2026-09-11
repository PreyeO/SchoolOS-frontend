import { TriangleAlert } from "lucide-react";

import type { GradeComponent } from "@/features/settings/api/grading-api";

export interface SubmissionScoreRow {
  // Only what the table renders. Narrower than StudentListItem on purpose —
  // the review payload nests a reduced student, and widening the contract here
  // would force a cast at the one call site for fields nobody reads.
  student: {
    id: string;
    user: { first_name: string; last_name: string };
    admission_number: string;
  };
  // One cell per component, in the same order. undefined means no mark exists.
  cells: (number | undefined)[];
  total: number;
  complete: boolean;
}

interface Props {
  components: GradeComponent[];
  rows: SubmissionScoreRow[];
}

// What the teacher actually submitted, component by component.
//
// The reviewer's job is spotting gaps before approving, so incompleteness is
// the thing the table is designed to surface: a count up top, a tinted row, and
// a dash rather than a zero in the cell — no mark and a mark of nought are
// different facts, and only one of them is a problem.
export function SubmissionScoresTable({ components, rows }: Props) {
  const incomplete = rows.filter((r) => !r.complete).length;

  return (
    <div className="space-y-3">
      {incomplete > 0 && (
        <p className="flex items-start gap-2 rounded-lg border border-amber/40 bg-amber/10 px-3.5 py-2.5 text-xs text-ink">
          <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-amber" />
          <span>
            {incomplete} of {rows.length} student{rows.length === 1 ? "" : "s"}{" "}
            {incomplete === 1 ? "is" : "are"} missing at least one score. Worth checking before
            you approve.
          </span>
        </p>
      )}

      <div className="max-h-104 overflow-auto rounded-lg border border-n-200">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-n-50">
            <tr className="text-left">
              <th scope="col" className="px-3 py-2 font-medium text-n-500">Student</th>
              {components.map((c) => (
                <th
                  key={c.id}
                  scope="col"
                  className="px-3 py-2 text-right font-medium text-n-500"
                >
                  {c.name}
                  <span className="block font-mono text-[10px] font-normal text-n-400">
                    /{c.max_obtainable}
                  </span>
                </th>
              ))}
              <th scope="col" className="px-3 py-2 text-right font-medium text-n-500">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-n-100">
            {rows.map(({ student, cells, total, complete }) => (
              <tr key={student.id} className={complete ? undefined : "bg-amber/5"}>
                <td className="px-3 py-2">
                  <span className="block truncate text-ink">
                    {student.user.first_name} {student.user.last_name}
                  </span>
                  <span className="block font-mono text-[10px] text-n-400">
                    {student.admission_number}
                  </span>
                </td>
                {cells.map((value, i) => (
                  <td key={components[i].id} className="px-3 py-2 text-right tabular-nums text-ink">
                    {value === undefined ? <span className="text-clay">—</span> : value}
                  </td>
                ))}
                <td className="px-3 py-2 text-right font-medium tabular-nums text-ink">
                  {Number(total.toFixed(2))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
