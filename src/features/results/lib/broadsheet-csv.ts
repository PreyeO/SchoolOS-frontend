import type { BroadsheetColumn, BroadsheetGridRow } from "../hooks/use-broadsheet";

// Same guard as bulk-import-credentials-csv.ts: a cell starting with =, +, -
// or @ runs as a formula in Excel/Sheets, so it's prefixed with a tab.
function csvCell(value: string | number | null): string {
  if (value === null) return '""';
  const text = String(value);
  const safe = typeof value === "string" && /^[=+\-@]/.test(text) ? `\t${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

interface BroadsheetCsvInput {
  title: string;
  columns: BroadsheetColumn[];
  rows: BroadsheetGridRow[];
  showGrades: boolean;
}

// The file's text, kept apart from the download so it can be tested.
//
// Grades get a column of their own rather than sharing the score's cell ("45
// F9"): a score left on its own stays a number in Excel, so a school can sort
// and sum it. The title line is there because the CSV is what gets printed for
// parents — without it the sheet doesn't say which class or term it is.
export function buildBroadsheetCsv({ title, columns, rows, showGrades }: BroadsheetCsvInput): string {
  const header = [
    "Student",
    "Admission No.",
    ...columns.flatMap((c) => (showGrades ? [c.name, `${c.name} Grade`] : [c.name])),
    "Total",
    "Average",
    "Position",
  ];

  const lines = rows.map((row) => [
    row.name,
    row.admissionNumber,
    ...columns.flatMap((c) => {
      const result = row.bySubject.get(c.subjectId);
      const score = result ? Number(result.total_score) : null;
      return showGrades ? [score, result?.grade ?? null] : [score];
    }),
    row.total,
    row.average,
    row.position,
  ]);

  return [[title], [], header, ...lines].map((line) => line.map(csvCell).join(",")).join("\r\n");
}

// Opens in Excel as well as Sheets — the escape hatch for a class too wide to
// print on one page. The BOM is what makes Excel read the file as UTF-8;
// without it, accented names come out garbled.
export function downloadBroadsheetCsv(input: BroadsheetCsvInput) {
  const csv = buildBroadsheetCsv(input);
  const blob = new Blob(["﻿", csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const slug = input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const link = document.createElement("a");
  link.href = url;
  link.download = `broadsheet-${slug}.csv`;
  link.click();

  URL.revokeObjectURL(url);
}
