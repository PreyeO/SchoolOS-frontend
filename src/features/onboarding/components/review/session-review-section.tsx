"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import type { AcademicSessionResponse } from "../../types";
import { useAddPeriod } from "../../hooks/use-period-mutations";
import { useDeleteSession, useUpdateSessionName } from "../../hooks/use-session-mutations";
import { EditNameDialog } from "./edit-name-dialog";
import { EditPeriodDialog } from "./edit-period-dialog";
import { PeriodRowReview } from "./period-row-review";
import { ReviewSectionShell } from "./review-section-shell";

export function SessionReviewSection({ session }: { session: AcademicSessionResponse | undefined }) {
  const updateName = useUpdateSessionName();
  const removeSession = useDeleteSession();
  const addPeriod = useAddPeriod();

  if (!session) {
    return (
      <ReviewSectionShell title="Academic session">
        <p className="text-sm text-n-400 italic">Skipped.</p>
      </ReviewSectionShell>
    );
  }

  const nextOrder = Math.max(0, ...session.periods.map((p) => p.order)) + 1;

  return (
    <ReviewSectionShell title="Academic session">
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium text-ink">{session.name}</p>
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
        {session.periods.map((p) => (
          <PeriodRowReview
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
    </ReviewSectionShell>
  );
}
