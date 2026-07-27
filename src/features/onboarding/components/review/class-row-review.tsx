"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import type { ClassResponse } from "../../types";
import { useAddArm } from "../../hooks/use-arm-mutations";
import { useDeleteClass, useUpdateClass } from "../../hooks/use-class-mutations";
import { nextArmName } from "../../lib/arm-utils";
import { EditNameDialog } from "./edit-name-dialog";
import { ArmRowReview } from "./arm-row-review";

export function ClassRowReview({ klass }: { klass: ClassResponse }) {
  const updateClass = useUpdateClass();
  const deleteClass = useDeleteClass();
  const addArm = useAddArm();

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

      <div className="flex flex-wrap items-center gap-1.5">
        {klass.arms.map((arm) => (
          <ArmRowReview key={arm.id} arm={arm} />
        ))}
        <EditNameDialog
          title={`Add an arm to ${klass.name}`}
          label="Arm name"
          initialValue={nextArmName(
            klass.name,
            klass.arms.map((a) => a.name),
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
      </div>
    </li>
  );
}
