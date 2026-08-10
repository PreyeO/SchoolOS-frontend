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
              "border-l border-n-200 px-2.5 py-1.5 text-xs font-medium transition-colors first:border-l-0",
              "focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary",
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
