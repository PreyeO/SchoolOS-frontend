import type { BulkImportSkippedRow } from "../types";

export function BulkImportSkippedTable({ rows }: { rows: BulkImportSkippedRow[] }) {
  return (
    <div className="max-h-56 overflow-auto rounded-xl border border-amber/30 bg-amber/5">
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 bg-amber/5">
          <tr className="border-b border-amber/20 text-xs uppercase tracking-wide text-n-400">
            <th className="px-3 py-2 font-medium">Row</th>
            <th className="px-3 py-2 font-medium">Reason</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.row} className="border-b border-amber/10 last:border-0">
              <td className="px-3 py-2 text-n-400">{row.row}</td>
              <td className="px-3 py-2 text-ink">{row.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
