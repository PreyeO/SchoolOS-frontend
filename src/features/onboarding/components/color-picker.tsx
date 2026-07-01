"use client";

import { useRef } from "react";
import { Check, Pipette } from "lucide-react";

import { COLOR_PRESETS } from "@/data/color-presets";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
}

const isPreset = (color: string) => COLOR_PRESETS.some((p) => p.value === color);

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-wrap gap-3 items-center">
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
          style={{ backgroundColor: preset.value, outlineColor: preset.value }}
          aria-pressed={value === preset.value}
          aria-label={preset.label}
        >
          {value === preset.value && (
            <Check className="size-4 text-white drop-shadow" />
          )}
        </button>
      ))}

      {/* Custom colour picker */}
      <div className="relative">
        <input
          ref={inputRef}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
          aria-label="Pick a custom colour"
          tabIndex={-1}
        />
        <button
          type="button"
          title="Pick a custom colour"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "relative flex size-9 items-center justify-center rounded-full border-2 border-dashed",
            "transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2",
            !isPreset(value)
              ? "border-transparent ring-2 ring-offset-2 ring-offset-background"
              : "border-n-300",
          )}
          style={
            !isPreset(value)
              ? { backgroundColor: value, outlineColor: value }
              : undefined
          }
          aria-label="Pick a custom colour"
        >
          {!isPreset(value) ? (
            <Check className="size-4 text-white drop-shadow" />
          ) : (
            <Pipette className="size-4 text-n-400" />
          )}
        </button>
      </div>
    </div>
  );
}
