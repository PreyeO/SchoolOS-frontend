"use client";

import { Pencil, Trash2 } from "lucide-react";

import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import type { ArmResponse } from "../../types";
import { useDeleteArm, useUpdateArm } from "../../hooks/use-arm-mutations";
import { EditNameDialog } from "./edit-name-dialog";

export function ArmRowReview({ arm }: { arm: ArmResponse }) {
  const updateArm = useUpdateArm();
  const deleteArm = useDeleteArm();

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-n-200 py-0.5 pl-2.5 pr-1.5 text-xs text-ink">
      {arm.name}
      <EditNameDialog
        title={`Rename ${arm.name}`}
        label="Arm name"
        initialValue={arm.name}
        isPending={updateArm.isPending}
        onSave={(name) => updateArm.mutateAsync({ id: arm.id, name })}
        trigger={
          <button type="button" aria-label={`Rename ${arm.name}`} className="cursor-pointer text-n-400 hover:text-brand">
            <Pencil className="size-3" />
          </button>
        }
      />
      <ConfirmDeleteDialog
        trigger={
          <button type="button" aria-label={`Delete arm ${arm.name}`} className="cursor-pointer text-n-400 hover:text-clay">
            <Trash2 className="size-3" />
          </button>
        }
        title={`Delete arm ${arm.name}?`}
        isPending={deleteArm.isPending}
        onConfirm={() => deleteArm.mutate(arm.id)}
      />
    </span>
  );
}
