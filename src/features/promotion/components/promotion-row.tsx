"use client";

import { Check, TriangleAlert } from "lucide-react";

import { ArmPicker } from "@/components/shared/arm-picker";
import type { ArmOptionGroup } from "@/lib/school/arm-options";
import { cn } from "@/lib/utils";

import type { PromotionDraftRow } from "../hooks/use-promotion-draft";

interface Props {
  row: PromotionDraftRow;
  armGroups: ArmOptionGroup[];
  onDestinationChange: (armId: string) => void;
  onToggle: () => void;
}

// One student, and where they're going.
//
// The destination picker offers every arm in the school rather than only the
// plausible next ones. Holding a student back isn't a special case on this API
// — you do it by assigning a same-level arm, including the one they're already
// in — so filtering the list would remove the only way to express a repeat.
export function PromotionRow({ row, armGroups, onDestinationChange, onToggle }: Props) {
  const { item, destinationArmId, selected, isCommitted } = row;
  const name = `${item.student.user.first_name} ${item.student.user.last_name}`;

  return (
    <li
      className={cn(
        "flex flex-wrap items-center gap-x-3 gap-y-2 px-5 py-3",
        isCommitted && "bg-n-50",
      )}
    >
      <input
        type="checkbox"
        checked={selected}
        disabled={isCommitted || !destinationArmId}
        onChange={onToggle}
        aria-label={`Promote ${name}`}
        className="size-4 shrink-0 accent-primary disabled:opacity-40"
      />

      {/* Wraps rather than truncating on a phone: the destination picker below
          has a 208px minimum, so beside it the name was left ~90px and cut to
          "Hauwa …". Truncation returns from sm up, where they share one line. */}
      <span className="min-w-0 flex-1">
        <span className="block text-sm text-ink sm:truncate">{name}</span>
        <span className="block font-mono text-[11px] text-n-400 sm:truncate">
          {item.student.admission_number} · {item.current_class_name}
        </span>
      </span>

      {isCommitted ? (
        <span className="flex shrink-0 items-center gap-1.5 text-xs text-grass">
          <Check className="size-3.5" />
          Promoted
        </span>
      ) : (
        // basis-full drops the picker onto its own line under the name on a phone;
        // pl-7 (checkbox 16px + the 12px gap) lines it up beneath the name rather
        // than under the checkbox. From sm up it sits at the end of the row again.
        <span className="flex basis-full items-center gap-2 pl-7 sm:basis-auto sm:shrink-0 sm:pl-0">
          {!destinationArmId && (
            <span className="flex items-center gap-1 text-xs text-amber">
              <TriangleAlert className="size-3.5" />
              Pick one
            </span>
          )}
          <ArmPicker
            id={`destination-${item.student.id}`}
            groups={armGroups}
            value={destinationArmId}
            onChange={onDestinationChange}
            placeholder="Choose class…"
            hasError={!destinationArmId}
          />
        </span>
      )}
    </li>
  );
}
