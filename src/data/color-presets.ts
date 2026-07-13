export interface ColorPreset {
  label: string;
  value: string;
}

export const COLOR_PRESETS: ColorPreset[] = [
  { label: "Forest (default)", value: "#1E5B4F" },
  { label: "Ocean", value: "#1D4ED8" },
  { label: "Plum", value: "#7E22CE" },
  { label: "Rose", value: "#BE123C" },
  { label: "Amber", value: "#B45309" },
  { label: "Teal", value: "#0F766E" },
  { label: "Slate", value: "#334155" },
  { label: "Ruby", value: "#9F1239" },
];

export const DEFAULT_PRIMARY_COLOR = "#1E5B4F";
export const DEFAULT_ACCENT_COLOR = "#F2A93B";
