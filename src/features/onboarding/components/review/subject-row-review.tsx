"use client";

import { Pencil, Trash2 } from "lucide-react";

import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import type { SchoolLevelValue } from "@/data/school-levels";
import type { SubjectResponse } from "../../types";
import { useDeleteSubject, useUpdateSubject } from "../../hooks/use-subject-mutations";
import { EditSubjectDialog } from "./edit-subject-dialog";

interface Props {
  subject: SubjectResponse;
  schoolLevels: SchoolLevelValue[];
}

export function SubjectRowReview({ subject, schoolLevels }: Props) {
  const updateSubject = useUpdateSubject();
  const deleteSubject = useDeleteSubject();

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-n-200 py-1 pr-1.5 pl-3 text-sm">
      <span className="text-ink">{subject.name}</span>
      {subject.is_core && (
        <span className="rounded-full border border-brand/30 bg-brand/10 px-1.5 py-0.5 text-[10px] font-medium text-brand">
          Core
        </span>
      )}
      <EditSubjectDialog
        initialValues={{ name: subject.name, level: subject.level, is_core: subject.is_core }}
        schoolLevels={schoolLevels}
        isPending={updateSubject.isPending}
        onSave={(values) => updateSubject.mutateAsync({ id: subject.id, payload: values })}
        trigger={
          <button type="button" aria-label={`Edit ${subject.name}`} className="cursor-pointer text-n-400 hover:text-brand">
            <Pencil className="size-3" />
          </button>
        }
      />
      <ConfirmDeleteDialog
        trigger={
          <button type="button" aria-label={`Delete ${subject.name}`} className="cursor-pointer text-n-400 hover:text-clay">
            <Trash2 className="size-3" />
          </button>
        }
        title={`Delete ${subject.name}?`}
        isPending={deleteSubject.isPending}
        onConfirm={() => deleteSubject.mutate(subject.id)}
      />
    </span>
  );
}
