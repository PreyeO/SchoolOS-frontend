import { cn } from "@/lib/utils";

import type { ReportCardOption } from "../types";

interface Props {
  sections: ReportCardOption[];
  enabled: string[];
  canEdit: boolean;
  isSaving: boolean;
  onToggle: (key: string) => void;
}

// Which blocks appear on the printed card, per level.
//
// Driven entirely by the options endpoint rather than a hardcoded list — the
// backend validates every key against its own enum, so inventing them here
// would only produce 400s the school can't act on.
export function ReportCardSectionToggles({
  sections,
  enabled,
  canEdit,
  isSaving,
  onToggle,
}: Props) {
  return (
    <section className="rounded-xl border border-n-200 bg-white p-5">
      <h2 className="font-display text-base font-semibold text-ink">Sections</h2>
      <p className="mt-0.5 text-xs text-n-400">
        Turn off anything your school doesn&rsquo;t report. The school name, logo and motto
        always print.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {sections.map((section) => {
          const on = enabled.includes(section.key);
          return (
            <label
              key={section.key}
              className={cn(
                "flex cursor-pointer items-center gap-2.5 rounded-lg border p-3 transition-colors",
                on ? "border-primary/40 bg-primary/5" : "border-n-200 hover:border-n-300",
                !canEdit && "cursor-not-allowed opacity-60",
              )}
            >
              <input
                type="checkbox"
                checked={on}
                disabled={!canEdit || isSaving}
                onChange={() => onToggle(section.key)}
                className="size-4 shrink-0 accent-primary"
              />
              <span className="min-w-0 truncate text-sm text-ink">{section.label}</span>
            </label>
          );
        })}
      </div>
    </section>
  );
}
