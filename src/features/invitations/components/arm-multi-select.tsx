"use client";

import { TriangleAlert } from "lucide-react";

import type { ClassRecord } from "@/lib/school/class-record";
import { pickableArms, isActiveArm } from "@/lib/school/real-arms";
import { SCHOOL_LEVELS, type SchoolLevelValue } from "@/data/school-levels";

interface ArmChoice {
  id: string;
  label: string;
  level: SchoolLevelValue;
  // Who currently holds this arm, if anyone. assign_class_teacher REPLACES an
  // existing class teacher without complaint, so picking a taken arm quietly
  // removes someone from it — the one consequence on this form that isn't
  // reversible by unticking a box afterwards.
  heldBy: string | null;
}

// Same flattening rule as buildArmOptions (a class whose only arm is the system
// placeholder contributes one option labelled by class, since "Default" is
// internal), but carrying the current class teacher, which the picker needs and
// the shared option shape doesn't have.
function toChoices(classes: ClassRecord[]): ArmChoice[] {
  return [...classes]
    .sort((a, b) => a.order - b.order)
    .flatMap((klass) => {
      const level = klass.level as SchoolLevelValue;
      const arms = pickableArms(klass);

      if (arms.length === 0) {
        const systemArm = klass.arms.find(isActiveArm);
        if (!systemArm) return [];
        return [
          { id: systemArm.id, label: klass.name, level, heldBy: systemArm.class_teacher?.name ?? null },
        ];
      }
      return arms.map((arm) => ({
        id: arm.id,
        label: `${klass.name} ${arm.name}`,
        level,
        heldBy: arm.class_teacher?.name ?? null,
      }));
    });
}

interface Props {
  classes: ClassRecord[];
  selected: string[];
  onChange: (armIds: string[]) => void;
}

export function ArmMultiSelect({ classes, selected, onChange }: Props) {
  const choices = toChoices(classes);
  const groups = SCHOOL_LEVELS.map((l) => ({
    label: l.label,
    items: choices.filter((c) => c.level === l.value),
  })).filter((g) => g.items.length > 0);

  function toggle(id: string, checked: boolean) {
    onChange(checked ? [...selected, id] : selected.filter((x) => x !== id));
  }

  if (choices.length === 0) {
    return <p className="text-sm text-n-400 italic">No class arms to assign yet.</p>;
  }

  return (
    <div className="max-h-64 space-y-3 overflow-y-auto rounded-xl border border-n-200 p-3">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-n-400">{group.label}</p>
          <div className="space-y-0.5">
            {group.items.map((arm) => (
              <label key={arm.id} className="flex cursor-pointer items-start gap-2 rounded-lg px-1.5 py-1 hover:bg-n-50">
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 shrink-0 accent-primary"
                  checked={selected.includes(arm.id)}
                  onChange={(e) => toggle(arm.id, e.target.checked)}
                />
                <span className="min-w-0">
                  <span className="block text-sm text-ink">{arm.label}</span>
                  {arm.heldBy && (
                    <span className="mt-0.5 flex items-center gap-1 text-xs text-clay">
                      <TriangleAlert className="size-3 shrink-0" />
                      {arm.heldBy} holds this arm and would be replaced
                    </span>
                  )}
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
