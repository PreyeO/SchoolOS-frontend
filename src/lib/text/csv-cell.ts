// One quoted CSV cell, safe to open in a spreadsheet.
//
// Excel/Sheets treats a cell starting with =, +, - or @ as a formula. A value
// like "=cmd|..." landing there unescaped is the classic CSV-injection vector;
// prefixing with a tab neutralises it without changing how the cell reads.
// Shared by every CSV the app hands out (bulk-import credentials, scratch-card
// PINs), so none of them can forget it.
export function csvCell(value: string): string {
  const safe = /^[=+\-@]/.test(value) ? `\t${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

// Rows of cells joined with CRLF, which Excel on Windows expects.
export function csvLines(rows: string[][]): string {
  return rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}
