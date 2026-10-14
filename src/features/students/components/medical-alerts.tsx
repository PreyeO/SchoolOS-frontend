import { TriangleAlert } from "lucide-react";

import type { StudentDetail } from "../types";

// The four free-text medical fields that describe something a member of staff
// may have to act on. Blood group and genotype are deliberately not here —
// they're reference data, always present, and would dilute a banner meant to
// mean "there is something about this child you need to know".
const ALERT_FIELDS: { key: keyof StudentDetail; label: string }[] = [
  { key: "allergies", label: "Allergies" },
  { key: "chronic_conditions", label: "Chronic conditions" },
  { key: "emergency_medications", label: "Emergency medications" },
  { key: "disabilities", label: "Disabilities" },
];

// Surfaces populated medical fields at the top of the profile instead of
// leaving them as four cells among eighteen.
//
// The reason is the teacher roster: a teacher opening a student mid-lesson is
// usually asking exactly one question, and "Allergic to peanuts" rendered in
// the same grey as a favourite food is a real safety problem, not a styling
// one. Renders nothing when every field is empty, so a profile with no medical
// notes gains no banner and the alert keeps its meaning.
export function MedicalAlerts({ student }: { student: StudentDetail }) {
  const alerts = ALERT_FIELDS.map(({ key, label }) => ({
    label,
    value: (student[key] as string | null)?.trim() || null,
  })).filter((a): a is { label: string; value: string } => a.value !== null);

  if (alerts.length === 0) return null;

  return (
    <div className="rounded-xl border border-clay/30 bg-clay/5 p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-ink">
        <TriangleAlert className="size-4 shrink-0 text-clay" />
        Medical notes
      </p>
      <dl className="mt-2.5 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
        {alerts.map((alert) => (
          <div key={alert.label}>
            <dt className="text-xs font-medium text-n-500">{alert.label}</dt>
            <dd className="mt-0.5 text-sm font-medium text-ink">{alert.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
