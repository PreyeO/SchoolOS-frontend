"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { NIGERIAN_STATES } from "@/data/nigerian-states";
import { PILOT_ROLES, STUDENT_RANGES } from "@/data/pilot";

import type { DemoRequestFilters } from "../types-demo-requests";
import type { PilotRole, StudentRange } from "@/features/pilot/types";

interface Props {
  value: DemoRequestFilters;
  onChange: (next: DemoRequestFilters) => void;
}

// The four filters the backend supports beyond status and search. Status has
// its own chips above — it's the one people reach for constantly, and burying
// it in a row of selects would make the common case slower.
//
// A date range rather than a single date: "leads from last week" is the
// question, and created_at_after alone can't ask it.
export function DemoRequestFilterBar({ value, onChange }: Props) {
  // status and search live outside this bar, so "clear" must not wipe them.
  const active = [value.role, value.student_range, value.state, value.created_at_after, value.created_at_before].filter(Boolean).length;

  function set(patch: Partial<DemoRequestFilters>) {
    onChange({ ...value, ...patch });
  }

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-n-200 bg-white p-3">
      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-n-400">Role</span>
        <Select
          className="h-9 w-auto"
          value={value.role ?? ""}
          onChange={(e) => set({ role: (e.target.value || undefined) as PilotRole | undefined })}
        >
          <option value="">Any role</option>
          {PILOT_ROLES.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </Select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-n-400">School size</span>
        <Select
          className="h-9 w-auto"
          value={value.student_range ?? ""}
          onChange={(e) =>
            set({ student_range: (e.target.value || undefined) as StudentRange | undefined })
          }
        >
          <option value="">Any size</option>
          {STUDENT_RANGES.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </Select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-n-400">State</span>
        <Select
          className="h-9 w-auto"
          value={value.state ?? ""}
          onChange={(e) => set({ state: e.target.value || undefined })}
        >
          <option value="">Any state</option>
          {NIGERIAN_STATES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </Select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-n-400">Received from</span>
        <Input
          type="date"
          className="h-9 w-auto"
          value={value.created_at_after ?? ""}
          onChange={(e) => set({ created_at_after: e.target.value || undefined })}
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-xs font-medium text-n-400">to</span>
        <Input
          type="date"
          className="h-9 w-auto"
          value={value.created_at_before ?? ""}
          onChange={(e) => set({ created_at_before: e.target.value || undefined })}
        />
      </label>

      {active > 0 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9"
          onClick={() =>
            set({
              role: undefined,
              student_range: undefined,
              state: undefined,
              created_at_after: undefined,
              created_at_before: undefined,
            })
          }
        >
          <X className="size-3.5" />
          Clear {active}
        </Button>
      )}
    </div>
  );
}
