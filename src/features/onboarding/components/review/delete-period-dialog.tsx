"use client";

import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";

import type { PeriodResponse } from "../../types";
import { useDeletePeriod, useUpdatePeriod } from "../../hooks/use-period-mutations";

interface Props {
  period: PeriodResponse;
  otherPeriods: PeriodResponse[];
  trigger: React.ReactNode;
}

// Plain confirm for a non-current period. For the current period, the backend
// has no auto-reassignment (delete_academic_period just deletes), so this
// prompts for which remaining term becomes current before deleting.
export function DeletePeriodDialog({ period, otherPeriods, trigger }: Props) {
  const deletePeriod = useDeletePeriod();
  const updatePeriod = useUpdatePeriod();
  const [chosenId, setChosenId] = useState(otherPeriods[0]?.id ?? "");
  const isPending = deletePeriod.isPending || updatePeriod.isPending;

  async function handleConfirm() {
    await deletePeriod.mutateAsync(period.id);
    if (chosenId) await updatePeriod.mutateAsync({ id: chosenId, payload: { is_current: true } });
  }

  if (!period.is_current) {
    return (
      <ConfirmDeleteDialog
        trigger={trigger}
        title={`Delete ${period.name}?`}
        description="This can't be undone."
        isPending={deletePeriod.isPending}
        onConfirm={() => deletePeriod.mutate(period.id)}
      />
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {period.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            {period.name} is the current term. Choose which term becomes current once it&rsquo;s removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <fieldset className="space-y-2">
          <legend className="sr-only">New current term</legend>
          {otherPeriods.map((p) => (
            <label key={p.id} className="flex items-center gap-2 text-sm text-ink">
              <input
                type="radio"
                name="new-current-period"
                className="accent-brand"
                checked={chosenId === p.id}
                onChange={() => setChosenId(p.id)}
              />
              {p.name}
            </label>
          ))}
        </fieldset>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={isPending || !chosenId}>
            {isPending ? "Removing…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
