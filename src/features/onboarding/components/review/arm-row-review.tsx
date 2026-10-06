"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { DeactivatedBadge } from "@/components/shared/deactivated-badge";
import { isActiveArm } from "@/lib/school/real-arms";
import type { ArmResponse } from "../../types";
import { useDeleteArm, useUpdateArm } from "../../hooks/use-arm-mutations";
import { ClassTeacherCell } from "./class-teacher-cell";
import { EditNameDialog } from "./edit-name-dialog";

// A row rather than a pill: an arm carries a name, a class teacher and two
// actions, which is more than a chip can hold legibly once real names are in it.
// Rows also put the teachers in a single scannable column, so "which arms still
// have nobody" is answerable at a glance instead of by reading every pill.
// `href` turns the name into a link to the arm's detail screen. Optional because
// this row is shared with the onboarding Review step, where sending someone off
// to a roster mid-wizard would drop them out of it.
export function ArmRowReview({ arm, href }: { arm: ArmResponse; href?: string }) {
  const updateArm = useUpdateArm();
  const deleteArm = useDeleteArm();
  // Kept listed on purpose: its attendance and results still exist and would
  // read as belonging to nothing if the arm vanished. But rename, delete and
  // class-teacher assignment all 400 for a deactivated arm ("Cannot update a
  // deactivated class arm."), so the controls come off rather than failing on
  // click. The name stays linked — its history is still worth opening.
  const active = isActiveArm(arm);

  return (
    // On narrow screens the name + actions share the first line and the teacher
    // pill drops to its own full-width line below, so the arm name isn't
    // squeezed down to "O…". From sm up it's the single row it always was.
    <li className="flex flex-wrap items-center gap-x-3 gap-y-1 py-1.5 sm:flex-nowrap">
      {href ? (
        <Link
          href={href}
          className={`min-w-0 flex-1 truncate text-sm hover:underline ${active ? "text-ink" : "text-n-500"}`}
        >
          {arm.name}
        </Link>
      ) : (
        <span className={`min-w-0 flex-1 truncate text-sm ${active ? "text-ink" : "text-n-500"}`}>
          {arm.name}
        </span>
      )}

      {!active && <DeactivatedBadge />}

      {active && (
        <div className="order-3 flex min-w-0 max-w-full basis-full sm:order-none sm:basis-auto">
          <ClassTeacherCell arm={arm} />
        </div>
      )}

      <span className="flex shrink-0 items-center">
        {active && (
        <>
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
          description="If any records depend on this arm it will be kept as deactivated rather than deleted, so its history stays intact. Students still enrolled must be moved first."
          isPending={deleteArm.isPending}
          onConfirm={() => deleteArm.mutate(arm.id)}
        />
        </>
        )}
      </span>
    </li>
  );
}
