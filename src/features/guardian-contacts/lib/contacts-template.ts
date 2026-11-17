// The header the backend demands exactly (messaging/services.py IMPORT_COLUMNS);
// any other header rejects the whole file. One example row shows that the
// leading zero is fine to lose (Excel strips it) and +234 works too.
const HEADER = ["admission_number", "guardian_name", "guardian_phone"];
const EXAMPLE_ROW = ["STU-2026-001", "Ngozi Okafor", "08031234567"];

export const CONTACTS_TEMPLATE_CSV = [HEADER, EXAMPLE_ROW].map((row) => row.join(",")).join("\r\n");

export function downloadContactsTemplate() {
  const blob = new Blob([CONTACTS_TEMPLATE_CSV], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "schoolos-parent-numbers-template.csv";
  link.click();
  URL.revokeObjectURL(url);
}
