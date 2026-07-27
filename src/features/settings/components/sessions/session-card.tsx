"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { EditNameDialog } from "@/features/onboarding/components/review/edit-name-dialog";
import { EditPeriodDialog } from "@/features/onboarding/components/review/edit-period-dialog";
import { useAddPeriod } from "@/features/onboarding/hooks/use-period-mutations";
import { useDeleteSession, useUpdateSessionName } from "@/features/onboarding/hooks/use-session-mutations";
import type { AcademicSessionResponse } from "@/features/onboarding/types";

import { TermRow } from "./term-row";

export function SessionCard({ session }: { session: AcademicSessionResponse }) {
  const updateName = useUpdateSessionName();
  const removeSession = useDeleteSession();
  const addPeriod = useAddPeriod();
  const isCurrent = session.periods.some((p) => p.is_current);
  const nextOrder = Math.max(0, ...session.periods.map((p) => p.order)) + 1;

  return (
    <div className="rounded-xl border border-n-200 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-ink">{session.name}</p>
          {isCurrent && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
              Current session
            </span>
          )}
        </div>
        <span className="flex shrink-0 items-center gap-1">
          <EditNameDialog
            title="Edit session name"
            label="Session name"
            initialValue={session.name}
            isPending={updateName.isPending}
            onSave={(name) => updateName.mutateAsync({ id: session.id, name })}
            trigger={
              <Button type="button" variant="ghost" size="icon-sm" aria-label="Edit session name">
                <Pencil className="size-3.5" />
              </Button>
            }
          />
          <ConfirmDeleteDialog
            trigger={
              <Button type="button" variant="ghost" size="icon-sm" aria-label={`Delete ${session.name}`}>
                <Trash2 className="size-3.5" />
              </Button>
            }
            title={`Delete ${session.name}?`}
            description="This removes the session and all its terms. This can't be undone."
            isPending={removeSession.isPending}
            onConfirm={() => removeSession.mutate(session.id)}
          />
        </span>
      </div>

      <ul className="space-y-1.5">
        {[...session.periods]
          .sort((a, b) => a.order - b.order)
          .map((p) => (
            <TermRow
              key={p.id}
              period={p}
              otherPeriods={session.periods.filter((x) => x.id !== p.id)}
              canDelete={session.periods.length > 1}
            />
          ))}
      </ul>

      <EditPeriodDialog
        title="Add a term"
        initialValues={{ name: "", start_date: "", end_date: "", is_current: false }}
        isPending={addPeriod.isPending}
        onSave={(values) => addPeriod.mutateAsync({ sessionId: session.id, payload: { ...values, order: nextOrder } })}
        trigger={
          <Button type="button" variant="ghost" size="sm" className="text-primary">
            <Plus className="size-4 mr-1" /> Add term
          </Button>
        }
      />
    </div>
  );
}
