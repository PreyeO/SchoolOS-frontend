import { Check, Copy } from "lucide-react";
import { useState } from "react";

import type { BulkImportAppliedRow } from "../types";

interface Props {
  rows: BulkImportAppliedRow[];
  // Preview rows always carry password: null — nothing is created yet, so
  // there's nothing to generate — while a committed new-account row has a
  // real one. Both cases still set password_note when a row reuses an
  // existing account. Without this distinction, a preview row for a
  // brand-new student would wrongly render "Existing account kept".
  stage: "preview" | "committed";
}

// Shared by the preview step and the result step so the two screens read as
// the same table, just filled in once the import actually runs.
export function BulkImportAppliedTable({ rows, stage }: Props) {
  return (
    <div className="max-h-72 overflow-auto rounded-xl border border-n-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="sticky top-0 bg-white">
          <tr className="border-b border-n-200 text-xs uppercase tracking-wide text-n-400">
            <th className="px-3 py-2 font-medium">Row</th>
            <th className="px-3 py-2 font-medium">Student</th>
            <th className="px-3 py-2 font-medium">Admission no.</th>
            <th className="px-3 py-2 font-medium">Class</th>
            <th className="px-3 py-2 font-medium">Email</th>
            <th className="px-3 py-2 font-medium">Password</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <AppliedRow key={row.row} row={row} stage={stage} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AppliedRow({ row, stage }: { row: BulkImportAppliedRow; stage: Props["stage"] }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!row.password) return;
    await navigator.clipboard.writeText(row.password);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <tr className="border-b border-n-100 last:border-0">
      <td className="px-3 py-2 text-n-400">{row.row}</td>
      <td className="px-3 py-2 font-medium text-ink">
        {row.first_name} {row.last_name}
      </td>
      <td className="px-3 py-2">{row.admission_number}</td>
      <td className="px-3 py-2">
        {row.class_name}
        {row.arm_name ? ` ${row.arm_name}` : ""}
      </td>
      <td className="px-3 py-2 text-n-500">{row.email}</td>
      <td className="px-3 py-2">
        {row.password ? (
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 font-mono text-xs text-ink hover:text-brand"
          >
            {row.password}
            {copied ? <Check className="size-3.5 text-grass" /> : <Copy className="size-3.5" />}
          </button>
        ) : (
          <span className="text-xs text-n-400 italic">
            {row.password_note ??
              (stage === "preview" ? "New account — password generated on import" : "Existing account kept")}
          </span>
        )}
      </td>
    </tr>
  );
}
