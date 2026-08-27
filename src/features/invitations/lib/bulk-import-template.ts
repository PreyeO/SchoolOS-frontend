const HEADER = [
  "first_name",
  "last_name",
  "admission_number",
  "gender",
  "date_of_birth",
  "class_name",
  "arm_name",
  "email",
];

// One example row so the format (date shape, that gender is lowercase, that
// arm_name/date_of_birth/email can be left blank) is obvious without reading
// a help paragraph. Matches accounts/services.py's BULK_STUDENT_IMPORT_COLUMNS
// exactly — the backend rejects the whole file if the header doesn't match
// this set exactly, so this template is the contract, not a suggestion.
const EXAMPLE_ROW = ["Jane", "Doe", "STU-2026-001", "female", "2015-03-12", "JSS1", "A", ""];

export function downloadBulkImportTemplate() {
  const csv = [HEADER, EXAMPLE_ROW].map((row) => row.join(",")).join("\r\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "schoolos-student-import-template.csv";
  link.click();

  URL.revokeObjectURL(url);
}
