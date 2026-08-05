import type { FieldErrors } from "react-hook-form";

import type { GradingSystemFormValues } from "../schemas/grading-schema";

type Errors = FieldErrors<GradingSystemFormValues>;
type RowErrors = Record<string, { message?: string } | undefined>;

// react-hook-form reports an array's own error on `.root.message` when the
// field is registered via useFieldArray, but zodResolver can also land it
// directly on `.message` — the same both-shapes check the onboarding steps
// already do (see step-classes.tsx's rootError).
export function arrayLevelMessage(field: Errors["components"] | Errors["ranges"]): string | undefined {
  if (!field) return undefined;
  if (field.root?.message) return field.root.message;
  return typeof field.message === "string" ? field.message : undefined;
}

// The first per-row problem, named so the toast can point at a specific row:
// "Component 2: Name is required". Without this, any row-level error fell
// through to a generic "check the form" message, because errors.components
// is an array whose own `.message` is undefined when only its rows are invalid.
function firstRowMessage(field: unknown, noun: string): string | undefined {
  if (!Array.isArray(field)) return undefined;

  for (let i = 0; i < field.length; i++) {
    const row = field[i] as RowErrors | undefined;
    if (!row) continue;
    for (const entry of Object.values(row)) {
      if (entry?.message) return `${noun} ${i + 1}: ${entry.message}`;
    }
  }
  return undefined;
}

// Single best message for the submit toast. Row-level problems are reported
// ahead of their section's array-level ones because a bad row is usually the
// root cause and the array message its consequence — a range with min 100 and
// max 70 also breaks "must end at 100", but telling someone to fix that row is
// far more actionable. Components come before ranges to match the form's order.
// The fallback should be unreachable: it only fires if a field somehow failed
// with no message attached.
export function resolveGradingFormError(errors: Errors): string {
  return (
    errors.level?.message ??
    firstRowMessage(errors.components, "Component") ??
    arrayLevelMessage(errors.components) ??
    firstRowMessage(errors.ranges, "Grade range") ??
    arrayLevelMessage(errors.ranges) ??
    "Please review the highlighted fields and try again."
  );
}
