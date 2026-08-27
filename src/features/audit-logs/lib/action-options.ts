import { ACTION_CATALOG } from "./action-catalog-data";
import { AUDIT_CATEGORIES } from "./audit-categories";

// A dropdown label derived mechanically from the action string itself —
// "fee_item.created" → "Fee Item — Created" — rather than a hand-written label
// per entry. The catalog's 82 `rest()` sentences are already the polished copy
// for the log rows; this only needs to be legible inside a picker, and deriving
// it means a newly-synced action gets a sane label for free, with nothing to
// keep in step by hand.
function actionLabel(action: string): string {
  const [resource, verb] = action.split(".");
  const words = (segment: string) =>
    segment
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  return verb ? `${words(resource)} — ${words(verb)}` : words(resource);
}

export interface ActionFilterGroup {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

// Built from ACTION_CATALOG rather than a second hardcoded list, so it can't
// drift from the icons: every action the catalog knows about appears here,
// grouped the same way the timeline's own icon rail groups them. Order follows
// AUDIT_CATEGORIES' own declared order; a category with nothing in it (there
// shouldn't be any) is simply omitted rather than shown empty.
export const ACTION_FILTER_GROUPS: ActionFilterGroup[] = (() => {
  const byCategory = new Map<string, { value: string; label: string }[]>();

  for (const action of Object.keys(ACTION_CATALOG)) {
    // user.registered is the one action with no category (see
    // audit-log-entry-row.tsx's Activity-icon fallback) — grouped under
    // "Other" here rather than dropped from the picker.
    const key = ACTION_CATALOG[action].category ?? "other";
    const list = byCategory.get(key) ?? [];
    list.push({ value: action, label: actionLabel(action) });
    byCategory.set(key, list);
  }

  const bySortedLabel = (a: { label: string }, b: { label: string }) => a.label.localeCompare(b.label);

  const groups: ActionFilterGroup[] = AUDIT_CATEGORIES.filter((c) => byCategory.has(c.key)).map((c) => ({
    key: c.key,
    label: c.label,
    options: (byCategory.get(c.key) ?? []).sort(bySortedLabel),
  }));

  const other = byCategory.get("other");
  if (other) groups.push({ key: "other", label: "Other", options: other.sort(bySortedLabel) });

  return groups;
})();
