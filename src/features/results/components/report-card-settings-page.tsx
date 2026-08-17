"use client";

import { useMemo, useState } from "react";

import { ErrorState } from "@/components/shared/error-state";
import { SCHOOL_LEVELS } from "@/data/school-levels";
import { useSchoolLevels } from "@/lib/school/use-school-levels";
import { useHasSchoolPermission } from "@/lib/auth/use-school-permission";
import { cn } from "@/lib/utils";

import {
  useReportCardOptions,
  useReportCardSettings,
  useUpdateReportCardSettings,
} from "../hooks/use-report-card";
import type { ReportCardOption } from "../types";

// What a school's report card looks like, per level. Settings are created lazily
// server-side on first read, so there's no "set this up" step — every level
// already has sensible defaults the moment it's opened.
export function ReportCardSettingsPage() {
  const { levels: schoolLevels, isLoading: levelsLoading } = useSchoolLevels();
  const [level, setLevel] = useState<string | null>(null);

  const levelOptions = useMemo(
    () => SCHOOL_LEVELS.filter((l) => schoolLevels.includes(l.value)),
    [schoolLevels],
  );
  const activeLevel = level ?? levelOptions[0]?.value ?? null;

  const { data: settings, isPending, isError, error } = useReportCardSettings(activeLevel);
  const { data: options } = useReportCardOptions();
  const update = useUpdateReportCardSettings();
  const canEdit = useHasSchoolPermission("manage_school_settings");

  function patch(payload: Parameters<typeof update.mutate>[0]["payload"]) {
    if (!activeLevel) return;
    update.mutate({ level: activeLevel, payload });
  }

  function toggleSection(key: string) {
    if (!settings) return;
    const enabled = settings.enabled_sections.includes(key);
    patch({
      // The list wholly replaces the stored one, so it's rebuilt rather than
      // diffed — the backend validates every key against its own enum.
      enabled_sections: enabled
        ? settings.enabled_sections.filter((s) => s !== key)
        : [...settings.enabled_sections, key],
    });
  }

  if (levelsLoading || isPending) {
    return <p className="text-sm text-n-400" role="status">Loading report card settings…</p>;
  }

  if (isError) {
    return <ErrorState error={error} resourceLabel="report card settings" />;
  }

  const pickers: { label: string; field: keyof typeof settings; choices: ReportCardOption[] }[] = [
    { label: "Template", field: "template_key", choices: options?.templates ?? [] },
    { label: "Fonts", field: "font_pairing", choices: options?.font_pairings ?? [] },
    { label: "Logo position", field: "logo_placement", choices: options?.logo_placements ?? [] },
    { label: "Border", field: "border_style", choices: options?.border_styles ?? [] },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">Report card design</h1>
        <p className="mt-1 text-sm text-n-500">
          Choose what appears on the printed report card, and how it looks. Set per level — a
          Primary card usually carries less than an SSS one.
        </p>
      </div>

      {!canEdit && (
        <p className="rounded-lg border border-n-200 bg-n-50 px-3.5 py-2.5 text-sm text-n-600">
          Your role doesn&rsquo;t include permission to change school settings, so this is
          read-only.
        </p>
      )}

      {levelOptions.length === 0 ? (
        <p className="text-sm text-n-400 italic">No levels are set up for this school yet.</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5">
            {levelOptions.map((l) => (
              <button
                key={l.value}
                type="button"
                onClick={() => setLevel(l.value)}
                aria-pressed={activeLevel === l.value}
                className={cn(
                  "cursor-pointer rounded-full border px-3 py-1.5 text-sm transition-colors",
                  activeLevel === l.value
                    ? "border-primary bg-primary/10 font-medium text-primary"
                    : "border-n-200 text-n-500 hover:border-n-300",
                )}
              >
                {l.label}
              </button>
            ))}
          </div>

          <section className="rounded-xl border border-n-200 bg-white p-5">
            <h2 className="font-display text-base font-semibold text-ink">Sections</h2>
            <p className="mt-0.5 text-xs text-n-400">
              Turn off anything your school doesn&rsquo;t report. The school name, logo and motto
              always print.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {(options?.sections ?? []).map((section) => {
                const enabled = settings.enabled_sections.includes(section.key);
                return (
                  <label
                    key={section.key}
                    className={cn(
                      "flex cursor-pointer items-center gap-2.5 rounded-lg border p-3 transition-colors",
                      enabled ? "border-primary/40 bg-primary/5" : "border-n-200 hover:border-n-300",
                      !canEdit && "cursor-not-allowed opacity-60",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={enabled}
                      disabled={!canEdit || update.isPending}
                      onChange={() => toggleSection(section.key)}
                      className="size-4 shrink-0 accent-primary"
                    />
                    <span className="min-w-0 truncate text-sm text-ink">{section.label}</span>
                  </label>
                );
              })}
            </div>
          </section>

          <section className="rounded-xl border border-n-200 bg-white p-5">
            <h2 className="font-display text-base font-semibold text-ink">Appearance</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {pickers.map((picker) => (
                <label key={picker.field} className="block">
                  <span className="mb-1.5 block text-sm text-n-500">{picker.label}</span>
                  <select
                    value={String(settings[picker.field] ?? "")}
                    disabled={!canEdit || update.isPending}
                    onChange={(e) => patch({ [picker.field]: e.target.value })}
                    className="h-9 w-full rounded-lg border border-input bg-background px-2 text-sm text-ink disabled:opacity-60"
                  >
                    {picker.choices.map((c) => (
                      <option key={c.key} value={c.key}>
                        {c.label}
                      </option>
                    ))}
                  </select>
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
                disabled={!canEdit || update.isPending}
                onChange={(e) => patch({ show_watermark: e.target.checked })}
                className="size-4 shrink-0 accent-primary"
              />
              <span className="text-sm text-ink">
                Show a faint school watermark behind the card
              </span>
            </label>
          </section>

          {/* No preview here on purpose: the preview endpoint renders one real
              student's card, so it belongs on Publish Results where a student is
              already in hand. Faking one would show a school a layout with
              nothing in it. */}
          <p className="text-xs text-n-400">
            Changes save as you make them. To see how a real card looks, open a student from
            Publish Results.
          </p>
        </>
      )}
    </div>
  );
}
