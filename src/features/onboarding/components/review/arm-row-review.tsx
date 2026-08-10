"use client";

import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import type { ArmResponse } from "../../types";
import { useDeleteArm, useUpdateArm } from "../../hooks/use-arm-mutations";
import { ClassTeacherCell } from "./class-teacher-cell";
import { EditNameDialog } from "./edit-name-dialog";

// A row rather than a pill: an arm carries a name, a class teacher and two
// actions, which is more than a chip can hold legibly once real names are in it.
// Rows also put the teachers in a single scannable column, so "which arms still
// have nobody" is answerable at a glance instead of by reading every pill.
export function ArmRowReview({ arm }: { arm: ArmResponse }) {
  const updateArm = useUpdateArm();
  const deleteArm = useDeleteArm();

  return (
    <li className="flex items-center gap-3 py-1.5">
      <span className="min-w-0 flex-1 truncate text-sm text-ink">{arm.name}</span>

      <ClassTeacherCell arm={arm} />

      <span className="flex shrink-0 items-center">
        <EditNameDialog
          title={`Rename ${arm.name}`}
          label="Arm name"
          initialValue={arm.name}
          isPending={updateArm.isPending}
          onSave={(name) => updateArm.mutateAsync({ id: arm.id, name })}
          trigger={
            <Button type="button" variant="ghost" size="icon-sm" aria-label={`Rename arm ${arm.name}`}>
              <Pencil className="size-3.5" />
            </Button>
          }
        />
        <ConfirmDeleteDialog
          trigger={
            <Button type="button" variant="ghost" size="icon-sm" aria-label={`Delete arm ${arm.name}`}>
              <Trash2 className="size-3.5" />
            </Button>
          }
          title={`Delete arm ${arm.name}?`}
          description="Students enrolled in this arm will need reassigning to another one."
          isPending={deleteArm.isPending}
          onConfirm={() => deleteArm.mutate(arm.id)}
        />
      </span>
    </li>
  );
}
