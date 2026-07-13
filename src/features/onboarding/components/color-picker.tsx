"use client";

import { useRef } from "react";
import { Check, Pipette } from "lucide-react";

import { COLOR_PRESETS } from "@/data/color-presets";
import { cn } from "@/lib/utils";

interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
}

const isPreset = (color: string) => COLOR_PRESETS.some((p) => p.value === color);
const CUSTOM_INDEX = COLOR_PRESETS.length;
const TOTAL = COLOR_PRESETS.length + 1;

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  const colorInputRef = useRef<HTMLInputElement>(null);
  const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedIndex = isPreset(value) ? COLOR_PRESETS.findIndex((p) => p.value === value) : CUSTOM_INDEX;

  function focusIndex(index: number) {
    buttonRefs.current[(index + TOTAL) % TOTAL]?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent, index: number) {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      focusIndex(index + 1);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      focusIndex(index - 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      focusIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      focusIndex(TOTAL - 1);
    }
  }

  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-3 items-center">
      {COLOR_PRESETS.map((preset, i) => (
        <button
          key={preset.value}
          ref={(el) => { buttonRefs.current[i] = el; }}
          type="button"
          role="radio"
          aria-checked={value === preset.value}
          aria-label={preset.label}
          title={preset.label}
          tabIndex={selectedIndex === i ? 0 : -1}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onClick={() => onChange(preset.value)}
          className={cn(
            "relative flex size-9 items-center justify-center rounded-full transition-transform",
            "hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2",
            value === preset.value && "ring-2 ring-offset-2 ring-offset-background",
          )}
          style={{ backgroundColor: preset.value, outlineColor: preset.value }}
        >
          {value === preset.value && <Check className="size-4 text-white drop-shadow" />}
        </button>
      ))}

      <div className="relative">
        <input
          ref={colorInputRef}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
          aria-hidden="true"
          tabIndex={-1}
        />
        <button
          ref={(el) => { buttonRefs.current[CUSTOM_INDEX] = el; }}
          type="button"
          role="radio"
          aria-checked={!isPreset(value)}
          aria-label="Custom colour"
          title="Pick a custom colour"
          tabIndex={selectedIndex === CUSTOM_INDEX ? 0 : -1}
          onKeyDown={(e) => handleKeyDown(e, CUSTOM_INDEX)}
          onClick={() => colorInputRef.current?.click()}
          className={cn(
            "relative flex size-9 items-center justify-center rounded-full border-2 border-dashed",
            "transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2",
            !isPreset(value) ? "border-transparent ring-2 ring-offset-2 ring-offset-background" : "border-n-300",
          )}
          style={!isPreset(value) ? { backgroundColor: value, outlineColor: value } : undefined}
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
