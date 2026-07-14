"use client";

import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PeriodResponse } from "../../types";
import { useUpdatePeriod } from "../../hooks/use-period-mutations";
import { EditPeriodDialog } from "./edit-period-dialog";
import { DeletePeriodDialog } from "./delete-period-dialog";

interface Props {
  period: PeriodResponse;
  otherPeriods: PeriodResponse[];
  canDelete: boolean;
}

export function PeriodRowReview({ period, otherPeriods, canDelete }: Props) {
  const updatePeriod = useUpdatePeriod();

  return (
    <li className="flex items-center justify-between gap-3 text-sm">
      <span className={period.is_current ? "font-medium text-brand" : "text-n-600"}>
        {period.name}
        {period.is_current && " (current)"}
        <span className="ml-2 text-n-400">
          {period.start_date} – {period.end_date}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-1">
        <EditPeriodDialog
          title={`Edit ${period.name}`}
          initialValues={{
            name: period.name,
            start_date: period.start_date,
            end_date: period.end_date,
            is_current: period.is_current,
          }}
          isPending={updatePeriod.isPending}
          onSave={(values) => updatePeriod.mutateAsync({ id: period.id, payload: values })}
          trigger={
            <Button type="button" variant="ghost" size="icon-sm" aria-label={`Edit ${period.name}`}>
              <Pencil className="size-3.5" />
            </Button>
          }
        />
        <DeletePeriodDialog
          period={period}
          otherPeriods={otherPeriods}
          trigger={
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              disabled={!canDelete}
              title={canDelete ? undefined : "A session needs at least one term — delete the whole session instead."}
              aria-label={`Delete ${period.name}`}
            >
              <Trash2 className="size-3.5" />
            </Button>
          }
        />
      </span>
    </li>
  );
}
