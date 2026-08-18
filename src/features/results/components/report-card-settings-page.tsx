"use client";

import { useMemo, useState } from "react";

import { ErrorState } from "@/components/shared/error-state";
import { SCHOOL_LEVELS } from "@/data/school-levels";
import { useSchoolLevels } from "@/lib/school/use-school-levels";
import { useHasSchoolPermission } from "@/lib/auth/use-school-permission";
import { cn } from "@/lib/utils";

import { ReportCardAppearance } from "./report-card-appearance";
import { ReportCardSectionToggles } from "./report-card-section-toggles";
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

          <ReportCardSectionToggles
            sections={options?.sections ?? []}
            enabled={settings.enabled_sections}
            canEdit={canEdit}
            isSaving={update.isPending}
            onToggle={toggleSection}
          />

          <ReportCardAppearance
            pickers={pickers}
            settings={settings}
            canEdit={canEdit}
            isSaving={update.isPending}
            onPatch={patch}
          />

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
