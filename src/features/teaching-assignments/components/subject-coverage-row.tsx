"use client";

import { Plus, Trash2, TriangleAlert, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { DeactivatedBadge } from "@/components/shared/deactivated-badge";
import { isActiveSubject } from "@/lib/school/active-subject";
import type { SubjectResponse } from "@/features/onboarding/types";

import { useRemoveArmSubject } from "../hooks/use-arm-subjects";
import { useDeleteAssignment } from "../hooks/use-assignment-mutations";
import type { SubjectAssignment } from "../types";

interface Props {
  subject: SubjectResponse;
  assignments: SubjectAssignment[];
  armLabel: string;
  // Id of the ClassArmSubjectOffering that puts this subject on the arm, so it
  // can be taken off again. Absent only while the offering list is still loading.
  offeringId?: string;
  onAssign: () => void;
}

export function SubjectCoverageRow({ subject, assignments, armLabel, offeringId, onAssign }: Props) {
  const remove = useDeleteAssignment();
  const removeOffering = useRemoveArmSubject();

  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2 py-2.5">
      {/* Full line on a phone, so the subject name isn't cut to "Infor…" by the
          teacher chips and buttons beside it; they wrap onto the line below. */}
      <span className="flex min-w-0 basis-full items-center gap-2 sm:flex-1 sm:basis-0">
        <span className={`text-sm sm:truncate ${isActiveSubject(subject) ? "text-ink" : "text-n-500"}`}>
          {subject.name}
        </span>
        {/* A subject deactivated after it was offered here still shows on the
            arm — the offering row survives with it. Without this it reads as a
            live subject that simply has no teacher, when in fact no teacher can
            be assigned and no score can be entered against it. The offering
            should be removed; the badge is what prompts that. */}
        {!isActiveSubject(subject) && <DeactivatedBadge />}
        {subject.is_core && (
          <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
            Core
          </span>
        )}
      </span>

      <span className="flex flex-wrap items-center gap-1.5">
        {assignments.length === 0 ? (
          // Unassigned is the state this page exists to surface: no teacher means
          // nobody can enter scores for this subject once results ships.
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber/40 bg-amber/10 px-2.5 py-1 text-xs text-ink">
            <TriangleAlert className="size-3.5 shrink-0 text-amber" />
            No teacher
          </span>
        ) : (
          assignments.map((assignment) => (
            <span
              key={assignment.id}
              className="inline-flex items-center gap-1 rounded-full border border-n-200 py-1 pl-2.5 pr-1 text-xs text-ink"
            >
              <span className="max-w-40 truncate">{assignment.teacher.name}</span>
              <ConfirmDeleteDialog
                trigger={
                  <button
                    type="button"
                    aria-label={`Remove ${assignment.teacher.name} from ${subject.name}`}
                    className="cursor-pointer rounded-full p-0.5 text-n-400 hover:bg-clay/10 hover:text-clay"
                  >
                    <X className="size-3" />
                  </button>
                }
                title={`Remove ${assignment.teacher.name} from ${subject.name}?`}
                description={`They will no longer be able to enter ${subject.name} scores for ${armLabel}.`}
                confirmLabel="Remove"
                isPending={remove.isPending}
                onConfirm={() => remove.mutate(assignment.id)}
              />
            </span>
          ))
        )}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onAssign}
          className="h-7 px-2 text-xs text-primary"
        >
          <Plus className="size-3 mr-0.5" />
          {assignments.length === 0 ? "Assign" : "Add"}
        </Button>

        {offeringId && (
          <ConfirmDeleteDialog
            trigger={
              <button
                type="button"
                aria-label={`Remove ${subject.name} from ${armLabel}`}
                className="cursor-pointer rounded-md p-1.5 text-n-400 transition-colors hover:bg-clay/10 hover:text-clay"
              >
                <Trash2 className="size-3.5" />
              </button>
            }
            title={`Remove ${subject.name} from ${armLabel}?`}
            // Two backend rules worth stating up front: removal is refused once
            // any score exists for this (arm, subject), and teacher assignments
            // are NOT cleared — both verified against the service.
            description={
              assignments.length > 0
                ? `${armLabel} will no longer take this subject. ${assignments.length === 1 ? "The teacher" : `All ${assignments.length} teachers`} assigned to it stay assigned, so remove them too if that isn't what you want. Not possible once scores have been entered.`
                : `${armLabel} will no longer take this subject. It stays available to add back, and can't be removed once scores have been entered.`
            }
            confirmLabel="Remove"
            isPending={removeOffering.isPending}
            onConfirm={() => removeOffering.mutate(offeringId)}
          />
        )}
      </span>
    </li>
  );
}
