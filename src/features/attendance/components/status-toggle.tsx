"use client";

import { cn } from "@/lib/utils";

import { STATUS_META } from "../lib/status-meta";
import { ATTENDANCE_STATUSES, type AttendanceStatus } from "../types";

interface Props {
  value: AttendanceStatus | null;
  onChange: (status: AttendanceStatus) => void;
  disabled?: boolean;
  studentName: string;
}

// A segmented control rather than a dropdown: marking a register is dozens of
// repetitions of the same four-way choice, and every extra click compounds. All
// four states stay visible so the teacher never opens a menu to see options.
export function StatusToggle({ value, onChange, disabled, studentName }: Props) {
  return (
    <div
      role="radiogroup"
      aria-label={`Attendance for ${studentName}`}
      className="inline-flex shrink-0 overflow-hidden rounded-lg border border-n-200"
    >
      {ATTENDANCE_STATUSES.map((status) => {
        const meta = STATUS_META[status];
        const isSelected = value === status;
        return (
          <button
            key={status}
            type="button"
            role="radio"
            aria-checked={isSelected}
            aria-label={meta.label}
            disabled={disabled}
            onClick={() => onChange(status)}
            className={cn(
              // Sized for a thumb first: this is the control a teacher repeats
              // for every student in the register, on a phone, often one-handed.
              // Below sm (where labels collapse to a single letter) each segment
              // is close to the 44px touch-target minimum; sm+ reverts to the
              // denser desktop sizing, matching the same breakpoint the
              // label/short-label swap already uses just below.
              "border-l border-n-200 px-3.5 py-3 text-xs font-medium transition-colors first:border-l-0 sm:px-2.5 sm:py-1.5",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
              disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
              isSelected
                ? meta.selected
                : "bg-white text-n-400 hover:bg-n-50 hover:text-n-600",
            )}
          >
            <span className="hidden sm:inline">{meta.label}</span>
            <span className="sm:hidden">{meta.short}</span>
          </button>
        );
      })}
    </div>
  );
}
