import type { BulkImportAppliedRow } from "../types";

// Excel/Sheets treats a cell starting with =, +, - or @ as a formula. These
// values came from the school's own uploaded CSV, not an outside attacker,
// but the export is meant to be re-opened in a spreadsheet — a name like
// "=cmd|..." landing there unescaped is the classic CSV-injection vector, and
// prefixing with a tab neutralises it without changing how the cell reads.
function csvCell(value: string): string {
  const safe = /^[=+\-@]/.test(value) ? `\t${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

// The file's text, kept apart from the download so it can be tested.
export function buildBulkImportCredentialsCsv(rows: BulkImportAppliedRow[]): string {
  const header = ["first_name", "last_name", "admission_number", "email", "password", "note"];
  const lines = rows.map((r) => [
    r.first_name,
    r.last_name,
    r.admission_number,
    r.email,
    r.password ?? "",
    r.password ? "" : (r.password_note ?? "Existing account kept"),
  ]);
  return [header, ...lines].map((row) => row.map(csvCell).join(",")).join("\r\n");
}

// A CSV of what a bulk import just created — the operational equivalent of
// the single-student credentials slip (student-credentials-result.tsx), but
// for however many rows one import creates, which printing one at a time
// doesn't scale to.
export function downloadBulkImportCredentials(rows: BulkImportAppliedRow[]) {
  const csv = buildBulkImportCredentialsCsv(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "schoolos-bulk-import-credentials.csv";
  link.click();

  URL.revokeObjectURL(url);
}
