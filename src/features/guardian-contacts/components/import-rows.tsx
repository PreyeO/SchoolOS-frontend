import { BulkImportSkippedTable } from "@/features/invitations/components/bulk-import-skipped-table";

import { formatNigerianPhone } from "../lib/phone";
import type { ContactImportResult } from "../types";

// The applied rows (with the number as the server will store it) and the
// skipped rows with their reasons. Shared by the preview and the result.
export function ImportRows({ result }: { result: ContactImportResult }) {
  return (
    <div className="space-y-3">
      {result.applied.length > 0 && (
        <div className="max-h-56 overflow-auto rounded-xl border border-n-200">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-white">
              <tr className="border-b border-n-200 text-xs uppercase tracking-wide text-n-400">
                <th className="px-3 py-2 font-medium">Row</th>
                <th className="px-3 py-2 font-medium">Student</th>
                <th className="px-3 py-2 font-medium">Parent</th>
              </tr>
            </thead>
            <tbody>
              {result.applied.map((r) => (
                <tr key={r.row} className="border-b border-n-100 last:border-0 align-top">
                  <td className="px-3 py-2 text-n-400">{r.row}</td>
                  <td className="px-3 py-2 font-mono text-xs text-ink">{r.admission_number}</td>
                  <td className="px-3 py-2 text-ink">
                    <span className="block wrap-break-word">{r.guardian_name}</span>
                    <span className="font-mono text-xs whitespace-nowrap text-n-500">{formatNigerianPhone(r.guardian_phone)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {result.skipped.length > 0 && <BulkImportSkippedTable rows={result.skipped} />}
    </div>
  );
}
