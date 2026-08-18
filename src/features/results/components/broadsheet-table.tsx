import { cn } from "@/lib/utils";

import type { BroadsheetColumn, BroadsheetGridRow } from "../hooks/use-broadsheet";

interface Props {
  columns: BroadsheetColumn[];
  rows: BroadsheetGridRow[];
}

// The grid itself: students down, subjects across, standing on the right.
//
// Always wider than the viewport, so the student column is sticky — a score you
// can't attribute to a child is useless. print:static undoes that for paper,
// where there's nothing to scroll and a sticky cell just lands wrong.
export function BroadsheetTable({ columns, rows }: Props) {
  return (
    <div className="overflow-x-auto print:overflow-visible">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-n-200">
            <th
              scope="col"
              className="sticky left-0 z-10 bg-white px-4 py-2.5 text-left font-medium text-n-500 print:static"
            >
              Student
            </th>
            {columns.map((column) => (
              <th
                key={column.subjectId}
                scope="col"
                className={cn(
                  "px-2 py-2.5 text-center font-medium whitespace-nowrap",
                  // Amber names the subject nobody has entered — the thing that
                  // will block the lock, readable straight off the header.
                  column.hasAnyScore ? "text-n-500" : "text-amber",
                )}
              >
                {column.name}
              </th>
            ))}
            <th scope="col" className="px-2 py-2.5 text-right font-medium text-n-500">
              Total
            </th>
            <th scope="col" className="px-2 py-2.5 text-right font-medium text-n-500">
              Avg
            </th>
            <th scope="col" className="px-3 py-2.5 text-right font-medium text-n-500">
              Pos
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-n-100">
          {rows.map((row) => (
            <tr key={row.studentId}>
              {/* Opaque, not a tint: this cell is sticky, so anything
                  translucent lets the subject columns scroll visibly under the
                  name. Empty rows are labelled instead of shaded, which also
                  survives printing — browsers drop backgrounds by default. */}
              <th
                scope="row"
                className="sticky left-0 z-10 bg-white px-4 py-2 text-left font-normal print:static"
              >
                <span className="block truncate text-ink">{row.name}</span>
                <span className="block truncate font-mono text-[11px] text-n-400">
                  {row.admissionNumber}
                  {row.isEmpty && <span className="ml-1.5 text-amber">no scores</span>}
                </span>
              </th>
              {columns.map((column) => {
                const result = row.bySubject.get(column.subjectId);
                return (
                  <td
                    key={column.subjectId}
                    className="px-2 py-2 text-center tabular-nums text-ink"
                  >
                    {result ? (
                      <>
                        {Number(result.total_score)}
                        {result.grade && (
                          <span className="ml-1 text-[11px] text-n-400">{result.grade}</span>
                        )}
                      </>
                    ) : (
                      <span className="text-n-300">—</span>
                    )}
                  </td>
                );
              })}
              <td className="px-2 py-2 text-right tabular-nums text-ink">
                {row.total ?? <span className="text-n-300">—</span>}
              </td>
              <td className="px-2 py-2 text-right tabular-nums text-ink">
                {row.average !== null ? `${row.average}%` : <span className="text-n-300">—</span>}
              </td>
              <td className="px-3 py-2 text-right tabular-nums font-medium text-ink">
                {row.position ?? <span className="text-n-300">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
