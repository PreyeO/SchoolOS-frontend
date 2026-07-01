"use client";

import { Check } from "lucide-react";

import { COLOR_PRESETS } from "@/data/color-presets";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {COLOR_PRESETS.map((preset) => (
        <button
          key={preset.value}
          type="button"
          title={preset.label}
          onClick={() => onChange(preset.value)}
          className={cn(
            "relative flex size-9 items-center justify-center rounded-full transition-transform",
            "hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2",
            value === preset.value && "ring-2 ring-offset-2 ring-offset-background",
          )}
          style={{
            backgroundColor: preset.value,
            outlineColor: preset.value,
          }}
          aria-pressed={value === preset.value}
          aria-label={preset.label}
        >
          {value === preset.value && (
            <Check className="size-4 text-white drop-shadow" />
          )}
        </button>
      ))}
    </div>
  );
}
