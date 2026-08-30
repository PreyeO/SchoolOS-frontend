"use client";

import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { DeactivatedBadge } from "@/components/shared/deactivated-badge";
import { isActiveSubject } from "@/lib/school/active-subject";
import { EditSubjectDialog } from "@/features/onboarding/components/review/edit-subject-dialog";
import { useDeleteSubject, useUpdateSubject } from "@/features/onboarding/hooks/use-subject-mutations";
import type { SubjectResponse } from "@/features/onboarding/types";
import { SCHOOL_LEVELS, type SchoolLevelValue } from "@/data/school-levels";

export function SubjectTableRow({ subject, schoolLevels }: { subject: SubjectResponse; schoolLevels: SchoolLevelValue[] }) {
  const updateSubject = useUpdateSubject();
  const deleteSubject = useDeleteSubject();
  const levelLabel = SCHOOL_LEVELS.find((l) => l.value === subject.level)?.label ?? subject.level;
  // Deleted while scores or offerings depended on it. The row stays so that
  // history resolves, but PATCH and DELETE both refuse it server-side
  // ("Cannot update a deactivated subject."), so the actions come off rather
  // than being left to fail on click. Viewing is all that's left.
  const active = isActiveSubject(subject);

  return (
    <tr className={`border-b border-n-100 last:border-0 ${active ? "" : "bg-n-50/60"}`}>
      <td className="px-3 py-2.5 text-sm">
        <span className={`inline-flex items-center gap-2 ${active ? "text-ink" : "text-n-500"}`}>
          {subject.name}
          {!active && <DeactivatedBadge />}
        </span>
      </td>
      <td className="px-3 py-2.5 text-sm text-n-500">{levelLabel}</td>
      <td className="px-3 py-2.5">
        {subject.is_core && (
          <span className="rounded-full border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
            Core
          </span>
        )}
      </td>
      <td className="px-3 py-2.5 text-right">
        <span className="inline-flex items-center gap-1">
          {active && (
          <>
          <EditSubjectDialog
            initialValues={{ name: subject.name, level: subject.level, is_core: subject.is_core }}
            schoolLevels={schoolLevels}
            isPending={updateSubject.isPending}
            onSave={(values) => updateSubject.mutateAsync({ id: subject.id, payload: values })}
            trigger={
              <Button type="button" variant="ghost" size="icon-sm" aria-label={`Edit ${subject.name}`}>
                <Pencil className="size-3.5" />
              </Button>
            }
          />
          <ConfirmDeleteDialog
            trigger={
              <Button type="button" variant="ghost" size="icon-sm" aria-label={`Delete ${subject.name}`}>
                <Trash2 className="size-3.5" />
              </Button>
            }
            title={`Delete ${subject.name}?`}
            isPending={deleteSubject.isPending}
            onConfirm={() => deleteSubject.mutate(subject.id)}
          />
          </>
          )}
        </span>
      </td>
    </tr>
  );
}
