import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

import type { ReportCardOption, ReportCardSettings } from "../types";

interface Picker {
  label: string;
  field: keyof ReportCardSettings;
  choices: ReportCardOption[];
}

interface Props {
  pickers: Picker[];
  settings: ReportCardSettings;
  canEdit: boolean;
  isSaving: boolean;
  onPatch: (payload: Partial<Omit<ReportCardSettings, "id" | "level" | "updated_at">>) => void;
}

// Template, fonts, logo placement, border and watermark.
//
// Brand colours are deliberately absent: they come from the School record at
// render time, not from report-card settings, so editing them here would be a
// second source of truth for the same value.
export function ReportCardAppearance({
  pickers,
  settings,
  canEdit,
  isSaving,
  onPatch,
}: Props) {
  return (
    <section className="rounded-xl border border-n-200 bg-white p-5">
      <h2 className="font-display text-base font-semibold text-ink">Appearance</h2>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        {pickers.map((picker) => (
          <label key={String(picker.field)} className="block">
            <span className="mb-1.5 block text-sm text-n-500">{picker.label}</span>
            <Select
              value={String(settings[picker.field] ?? "")}
              disabled={!canEdit || isSaving}
              onChange={(e) => onPatch({ [picker.field]: e.target.value })}
            >
              {picker.choices.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label}
                </option>
              ))}
            </Select>
          </label>
        ))}
      </div>

      <label
        className={cn(
          "mt-4 flex items-center gap-2.5",
          canEdit ? "cursor-pointer" : "cursor-not-allowed opacity-60",
        )}
      >
        <input
          type="checkbox"
          checked={settings.show_watermark}
          disabled={!canEdit || isSaving}
          onChange={(e) => onPatch({ show_watermark: e.target.checked })}
          className="size-4 shrink-0 accent-primary"
        />
        <span className="text-sm text-ink">Show a faint school watermark behind the card</span>
      </label>
    </section>
  );
}
