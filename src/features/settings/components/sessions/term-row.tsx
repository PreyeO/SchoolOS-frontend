"use client";

import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EditPeriodDialog } from "@/features/onboarding/components/review/edit-period-dialog";
import { DeletePeriodDialog } from "@/features/onboarding/components/review/delete-period-dialog";
import { useMarkPeriodCurrent, useUpdatePeriod } from "@/features/onboarding/hooks/use-period-mutations";
import type { PeriodResponse } from "@/features/onboarding/types";

import { formatDateRange } from "../../lib/format-date-range";

interface Props {
  period: PeriodResponse;
  otherPeriods: PeriodResponse[];
  canDelete: boolean;
}

export function TermRow({ period, otherPeriods, canDelete }: Props) {
  const updatePeriod = useUpdatePeriod();
  const markCurrent = useMarkPeriodCurrent();

  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border border-n-100 px-3 py-2">
      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate text-sm font-medium text-ink">{period.name}</span>
        {period.is_current && (
          <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
            Current
          </span>
        )}
        <span className="shrink-0 text-xs text-n-400">{formatDateRange(period.start_date, period.end_date)}</span>
      </div>
      <span className="flex shrink-0 items-center gap-1">
        {/* Term rollover is a recurring chore, so it gets a direct action rather
            than living only as a checkbox inside the edit dialog. The endpoint
            unsets the previous current term itself, so there's nothing to
            confirm or clean up. */}
        {!period.is_current && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-primary"
            disabled={markCurrent.isPending}
            onClick={() => markCurrent.mutate(period.id)}
          >
            {markCurrent.isPending ? "Setting…" : "Make current"}
          </Button>
        )}
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
