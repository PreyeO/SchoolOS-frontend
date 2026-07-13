import type { FieldErrors } from "react-hook-form";

// Recursively finds the dotted path of the first invalid field (e.g.
// "periods.0.start_date"), matching react-hook-form's own field-name format.
// Every step gives its inputs an id equal to this same dotted path, so on a
// failed submit we can move focus to the first error with document.getElementById.
export function firstErrorFieldId(errors: FieldErrors): string | undefined {
  for (const [key, value] of Object.entries(errors)) {
    if (!value) continue;
    if (typeof value === "object" && "message" in value && typeof value.message === "string" && !("length" in value)) {
      return key;
    }
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const nested = firstErrorFieldId((value[i] ?? {}) as FieldErrors);
        if (nested) return `${key}.${i}.${nested}`;
      }
    } else if (typeof value === "object") {
      const nested = firstErrorFieldId(value as FieldErrors);
      if (nested) return `${key}.${nested}`;
    }
  }
  return undefined;
}

export function focusFirstError(errors: FieldErrors) {
  const id = firstErrorFieldId(errors);
  if (!id) return;
  document.getElementById(id)?.focus();
}
