"use client";

import { ClassPicker } from "@/components/shared/class-picker";
import { TermPicker } from "@/components/shared/term-picker";
import type { ClassOptionGroup } from "@/lib/school/class-options";
import type { PeriodOptionGroup } from "@/lib/school/period-options";

interface Props {
  classGroups: ClassOptionGroup[];
  classId: string | null;
  onClassChange: (id: string) => void;
  termGroups: PeriodOptionGroup[];
  periodId: string | null;
  onPeriodChange: (id: string) => void;
  showInactive: boolean;
  onShowInactiveChange: (next: boolean) => void;
  inactiveCount: number;
}

// Which class, which term — the two coordinates a fee item is pinned to.
//
// The inactive toggle only appears when there is something to reveal. It is a
// pure client-side filter: the list is fetched without an is_active param and
// holds both sets already, so flipping it costs no request.
export function FeeItemsContextBar({
  classGroups,
  classId,
  onClassChange,
  termGroups,
  periodId,
  onPeriodChange,
  showInactive,
  onShowInactiveChange,
  inactiveCount,
}: Props) {
  return (
    <div className="flex flex-wrap items-end gap-x-4 gap-y-3 rounded-xl border border-n-200 bg-white p-4">
      <ClassPicker groups={classGroups} value={classId} onChange={onClassChange} label="Class" />
      <TermPicker groups={termGroups} value={periodId} onChange={onPeriodChange} label="Term" />

      {inactiveCount > 0 && (
        <label className="flex items-center gap-2 pb-1.5 text-sm text-n-500">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => onShowInactiveChange(e.target.checked)}
            className="size-4 rounded border-n-300 text-primary focus-visible:ring-3 focus-visible:ring-ring/50"
          />
          Show {inactiveCount} retired {inactiveCount === 1 ? "fee" : "fees"}
        </label>
      )}
    </div>
  );
}
