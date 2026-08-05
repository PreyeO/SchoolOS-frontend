import type { AuditChangeValue, AuditLogChange } from "../types";

// Field names read straight off the model, so snake_case -> sentence case
// covers nearly all of them. Only the ones that would still read badly are
// overridden.
const FIELD_LABELS: Record<string, string> = {
  school_admin_role: "Role",
  is_current: "Current term",
  is_core: "Core subject",
  max_obtainable: "Max score",
};

export function fieldLabel(field: string): string {
  const override = FIELD_LABELS[field];
  if (override) return override;
  const spaced = field.replace(/_/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function formatValue(value: AuditChangeValue): string {
  if (value === null || value === undefined || value === "") return "Not set";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  // A permissions array is a real JSON list in `changes` — showing its length
  // beats dumping 20 permission strings into a log row.
  if (Array.isArray(value)) return `${value.length} item${value.length === 1 ? "" : "s"}`;
  if (typeof value === "object") return "Changed";
  return String(value);
}

export interface FormattedChange {
  label: string;
  from: string;
  to: string;
  // Net movement, only when both sides are countable lists — the detail that
  // makes "12 items -> 15 items" actually mean something at a glance.
  delta?: string;
}

export function formatChange(change: AuditLogChange): FormattedChange {
  const formatted: FormattedChange = {
    label: fieldLabel(change.field),
    from: formatValue(change.old),
    to: formatValue(change.new),
  };

  if (Array.isArray(change.old) && Array.isArray(change.new)) {
    const diff = change.new.length - change.old.length;
    if (diff !== 0) formatted.delta = diff > 0 ? `+${diff}` : `${diff}`;
  }

  return formatted;
}
