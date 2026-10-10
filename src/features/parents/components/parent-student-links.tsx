"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { useDeleteParentStudentLink } from "@/features/parent-student-links/hooks/use-delete-parent-student-link";

import { PARENT_DETAIL_QUERY_KEY } from "../hooks/use-parent-detail";
import type { ParentStudentLink } from "../types";

interface Props {
  parentId: string;
  links: ParentStudentLink[];
  // No unlink control: a former parent's links are history, and unlinking
  // needs add_students anyway.
  readOnly?: boolean;
}

export function ParentStudentLinks({ parentId, links, readOnly = false }: Props) {
  const deleteLink = useDeleteParentStudentLink();
  const queryClient = useQueryClient();

  function handleUnlink(id: string) {
    deleteLink.mutate(id, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: PARENT_DETAIL_QUERY_KEY(parentId) }),
    });
  }

  if (links.length === 0) {
    return <p className="text-sm text-n-400 italic">No children linked yet.</p>;
  }

  return (
    <ul className="space-y-2">
      {links.map((link) => (
        <li key={link.id} className="flex items-center justify-between gap-3 rounded-lg border border-n-100 px-3 py-2">
          <div className="min-w-0">
            <Link href={`/students/${link.student_id}`} className="text-sm font-medium text-ink hover:underline">
              {link.student_name}
            </Link>
            <p className="text-xs text-n-500">Admission no. {link.admission_number}</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <span className="rounded-full bg-n-100 px-2 py-0.5 text-[11px] text-n-500 capitalize">
              {link.relationship}
            </span>
            {link.is_primary_contact && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                Primary contact
              </span>
            )}
            {!readOnly && (
              <ConfirmDeleteDialog
                trigger={
                  <Button type="button" variant="ghost" size="icon-sm" aria-label={`Unlink ${link.student_name}`}>
                    <Trash2 className="size-3.5" />
                  </Button>
                }
                title={`Unlink ${link.student_name}?`}
                description="This removes the connection between this parent and student. It can be re-linked later."
                confirmLabel="Unlink"
                isPending={deleteLink.isPending}
                onConfirm={() => handleUnlink(link.id)}
              />
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
