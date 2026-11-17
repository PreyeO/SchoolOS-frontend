"use client";

import { Pencil, Star, Trash2 } from "lucide-react";

import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { Button } from "@/components/ui/button";

import { useDeleteContact, useUpdateContact } from "../hooks/use-guardian-contacts";
import { formatNigerianPhone } from "../lib/phone";
import type { GuardianContact } from "../types";

interface Props {
  contacts: GuardianContact[];
  onEdit: (contact: GuardianContact) => void;
}

// One layout at every width: two short lines plus icon actions fit a phone.
export function ContactsList({ contacts, onEdit }: Props) {
  const update = useUpdateContact();
  const remove = useDeleteContact();

  return (
    <ul className="divide-y divide-n-100 rounded-xl border border-n-200 bg-white">
      {contacts.map((c) => (
        <li key={c.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-ink wrap-break-word">{c.name}</span>
              <span className="font-mono text-sm tabular-nums whitespace-nowrap text-ink">{formatNigerianPhone(c.phone)}</span>
              {c.is_primary && (
                <span className="rounded-full border border-grass/30 bg-grass/10 px-2 py-0.5 text-[11px] font-medium text-grass">
                  Main
                </span>
              )}
            </div>
            <p className="text-xs text-n-500 wrap-break-word">
              {c.student_name} · <span className="font-mono">{c.admission_number}</span>
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {!c.is_primary && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-xs"
                disabled={update.isPending}
                onClick={() => update.mutate({ id: c.id, is_primary: true })}
              >
                <Star className="size-3.5" /> Make main
              </Button>
            )}
            <Button type="button" variant="ghost" size="icon" className="size-8" aria-label={`Edit ${c.name}`} onClick={() => onEdit(c)}>
              <Pencil className="size-3.5" />
            </Button>
            <ConfirmDeleteDialog
              trigger={
                <Button type="button" variant="ghost" size="icon" className="size-8 text-clay" aria-label={`Remove ${c.name}`}>
                  <Trash2 className="size-3.5" />
                </Button>
              }
              title={`Remove ${c.name}'s number?`}
              description={
                c.is_primary
                  ? `This is ${c.student_name}'s main number. Until another is made main, their card PIN can only be texted to a linked parent account's phone, if there is one. Cards already sent are not affected.`
                  : "Cards already sent to this number are not affected."
              }
              confirmLabel="Remove"
              isPending={remove.isPending}
              onConfirm={() => remove.mutate(c.id)}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
