"use client";

import { ArrowRight } from "lucide-react";

import { ArmPicker } from "@/components/shared/arm-picker";
import { Select } from "@/components/ui/select";
import type { ArmOptionGroup } from "@/lib/school/arm-options";

interface SessionOption {
  id: string;
  name: string;
}

interface Props {
  armGroups: ArmOptionGroup[];
  armId: string | null;
  onArmChange: (id: string) => void;
  sessions: SessionOption[];
  sourceSessionId: string | null;
  onSourceChange: (id: string) => void;
  targetSessionId: string | null;
  onTargetChange: (id: string) => void;
}

// Who is moving, out of which year, into which.
//
// Source and target are both explicit. Preview will fall back to the school's
// current session when source is omitted, but promote won't — it requires the
// id and refuses if the two match — so asking for both here keeps the two
// requests describing the same thing and makes the "same session" mistake
// visible before it's a 400.
export function PromotionContextBar({
  armGroups,
  armId,
  onArmChange,
  sessions,
  sourceSessionId,
  onSourceChange,
  targetSessionId,
  onTargetChange,
}: Props) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-n-200 bg-white p-4">
      <label className="flex items-center gap-2 text-sm">
        <span className="text-n-500">Promote from</span>
        <ArmPicker groups={armGroups} value={armId} onChange={onArmChange} label="Source class" />
      </label>

      <label className="flex items-center gap-2 text-sm">
        <span className="text-n-500">Leaving</span>
        <Select
          value={sourceSessionId ?? ""}
          onChange={(e) => onSourceChange(e.target.value)}
          aria-label="Source session"
          className="min-w-36"
        >
          {sessions.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
      </label>

      <ArrowRight className="mb-2 size-4 shrink-0 text-n-300" />

      <label className="flex items-center gap-2 text-sm">
        <span className="text-n-500">Joining</span>
        <Select
          value={targetSessionId ?? ""}
          onChange={(e) => onTargetChange(e.target.value)}
          aria-label="Target session"
          className="min-w-36"
        >
          <option value="">Choose session…</option>
          {sessions
            .filter((s) => s.id !== sourceSessionId)
            .map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
        </Select>
      </label>
    </div>
  );
}
