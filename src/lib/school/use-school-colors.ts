"use client";

import { useSchoolStore } from "@/stores/school-store";
import { DEFAULT_ACCENT_COLOR, DEFAULT_PRIMARY_COLOR } from "@/data/color-presets";

// The one source for any JS-level (non-CSS) need for the school's colors —
// chart fill/stroke, inline SVG, etc. can't read CSS custom properties, so
// this resolves the same store fields dashboard-shell.tsx exposes as
// --shell-primary/--shell-accent, with the exact same fallbacks (the CSS
// system falls back to --brand/--amber, which equal these same hex values).
export function useSchoolColors() {
  const primary = useSchoolStore((s) => s.currentSchool?.primaryColor) ?? DEFAULT_PRIMARY_COLOR;
  const accent = useSchoolStore((s) => s.currentSchool?.accentColor) ?? DEFAULT_ACCENT_COLOR;
  return { primary, accent };
}
