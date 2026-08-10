"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { realArms } from "@/lib/school/real-arms";
import type { ClassResponse } from "../../types";
import { useAddArm } from "../../hooks/use-arm-mutations";
import { useDeleteClass, useUpdateClass } from "../../hooks/use-class-mutations";
import { nextArmName } from "../../lib/arm-utils";
import { EditNameDialog } from "./edit-name-dialog";
import { ArmRowReview } from "./arm-row-review";
import { ClassTeacherCell } from "./class-teacher-cell";

export function ClassRowReview({ klass }: { klass: ClassResponse }) {
  const updateClass = useUpdateClass();
  const deleteClass = useDeleteClass();
  const addArm = useAddArm();

  // The system placeholder arm is never shown as a section. A class with only
  // that arm reads as having no arms at all — but it still has a class teacher,
  // so that control is surfaced on the class row instead of on a hidden chip.
  const arms = realArms(klass);
  const systemArm = arms.length === 0 ? klass.arms[0] : undefined;

  return (
    <li className="rounded-lg border border-n-200 p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-ink">{klass.name}</span>
        <span className="flex shrink-0 items-center gap-1">
          <EditNameDialog
            title={`Rename ${klass.name}`}
            label="Class name"
            initialValue={klass.name}
            isPending={updateClass.isPending}
            onSave={(name) => updateClass.mutateAsync({ id: klass.id, payload: { name } })}
            trigger={
              <Button type="button" variant="ghost" size="icon-sm" aria-label={`Rename ${klass.name}`}>
                <Pencil className="size-3.5" />
              </Button>
            }
          />
          <ConfirmDeleteDialog
            trigger={
              <Button type="button" variant="ghost" size="icon-sm" aria-label={`Delete ${klass.name}`}>
                <Trash2 className="size-3.5" />
              </Button>
            }
            title={`Delete ${klass.name}?`}
            description="This removes the class and any arms."
            isPending={deleteClass.isPending}
            onConfirm={() => deleteClass.mutate(klass.id)}
          />
        </span>
      </div>

      {/* A class with no arms of its own still has a class teacher — held on the
          hidden system arm. "Whole class" names the teaching unit and keeps the
          teacher cell in the same column as it sits in on real arm rows. */}
      {systemArm && (
        <div className="flex items-center gap-3 border-t border-n-100 py-1.5">
          <span className="min-w-0 flex-1 truncate text-sm text-n-400">Whole class</span>
          <ClassTeacherCell arm={systemArm} label={klass.name} />
        </div>
      )}

      {arms.length > 0 && (
        <ul className="divide-y divide-n-100 border-t border-n-100">
          {arms.map((arm) => (
            <ArmRowReview key={arm.id} arm={arm} />
          ))}
        </ul>
      )}

      <EditNameDialog
        title={`Add an arm to ${klass.name}`}
        label="Arm name"
        initialValue={nextArmName(
          klass.name,
          arms.map((a) => a.name),
        )}
        isPending={addArm.isPending}
        onSave={(name) => addArm.mutateAsync({ classId: klass.id, name })}
        trigger={
          <button
            type="button"
            className="inline-flex cursor-pointer items-center gap-0.5 text-xs font-medium text-primary hover:underline"
          >
            <Plus className="size-3" /> Add arm
          </button>
        }
      />
    </li>
  );
}
