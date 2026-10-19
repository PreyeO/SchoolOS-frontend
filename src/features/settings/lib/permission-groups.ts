// Mirrors the section comments in accounts/permissions.py's SCHOOL_PERMISSIONS —
// purely a display grouping, kept in sync by hand. Any catalog permission not
// listed here still renders, just under the "Other" fallback group below.
const PERMISSION_GROUPS: { label: string; permissions: string[] }[] = [
  { label: "Students", permissions: ["view_students", "add_students", "edit_students", "delete_students"] },
  { label: "Parents", permissions: ["view_parents"] },
  { label: "Staff", permissions: ["view_staff", "add_staff", "edit_staff", "delete_staff"] },
  { label: "Fees", permissions: ["view_fees", "record_fees", "edit_fees", "delete_fees", "export_fees"] },
  { label: "Results", permissions: ["view_results", "lock_results", "unlock_results"] },
  { label: "Attendance", permissions: ["view_attendance", "edit_attendance"] },
  { label: "Communication", permissions: ["post_notices", "send_sms"] },
  { label: "Settings", permissions: ["manage_roles", "manage_school_settings", "view_analytics"] },
  { label: "Academic", permissions: ["manage_academic_structure"] },
  { label: "Result cards", permissions: ["manage_scratch_cards"] },
];

export function permissionLabel(permission: string): string {
  const words = permission.split("_");
  return words[0].charAt(0).toUpperCase() + words[0].slice(1) + " " + words.slice(1).join(" ");
}

// Groups the live catalog (source of truth for which permissions exist) by
// the static labels above, so a permission the frontend doesn't recognize
// still shows up instead of silently disappearing.
export function groupPermissions(catalog: string[]): { label: string; permissions: string[] }[] {
  const known = new Set(PERMISSION_GROUPS.flatMap((g) => g.permissions));
  const groups = PERMISSION_GROUPS.map((g) => ({
    label: g.label,
    permissions: g.permissions.filter((p) => catalog.includes(p)),
  })).filter((g) => g.permissions.length > 0);

  const other = catalog.filter((p) => !known.has(p));
  if (other.length > 0) groups.push({ label: "Other", permissions: other });

  return groups;
}
