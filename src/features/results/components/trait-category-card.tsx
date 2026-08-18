"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";

import type { BehavioralTrait } from "../types";

interface Props {
  label: string;
  hint: string;
  traits: BehavioralTrait[];
  draft: string;
  onDraftChange: (value: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
  isAdding: boolean;
  isDeleting: boolean;
  placeholder: string;
}

// One category's trait list plus its add field.
//
// Deletion copy stays vague on purpose: the backend deletes outright only when
// nothing references the trait and otherwise deactivates it, so promising
// either would be wrong half the time. What matters to the school is that past
// report cards keep their wording, which is true on both paths.
export function TraitCategoryCard({
  label,
  hint,
  traits,
  draft,
  onDraftChange,
  onAdd,
  onDelete,
  isAdding,
  isDeleting,
  placeholder,
}: Props) {
  return (
    <section className="rounded-xl border border-n-200 bg-white p-5">
      <h2 className="font-display text-base font-semibold text-ink">{label}</h2>
      <p className="mt-0.5 text-xs text-n-400">{hint}</p>

      {traits.length === 0 ? (
        <p className="mt-4 text-sm text-n-400 italic">
          Nothing here yet — teachers will see no {label.toLowerCase()} section until you add one.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-n-100">
          {traits.map((trait) => (
            <li key={trait.id} className="flex items-center gap-3 py-2">
              <span className="min-w-0 flex-1 truncate text-sm text-ink">{trait.name}</span>
              <ConfirmDeleteDialog
                title={`Remove ${trait.name}?`}
                description="If any student has already been rated on it, it's kept on their past report cards and simply stops appearing for new ones."
                isPending={isDeleting}
                onConfirm={() => onDelete(trait.id)}
                trigger={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Remove ${trait.name}`}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                }
              />
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex gap-2">
        <Input
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAdd();
            }
          }}
          placeholder={placeholder}
          aria-label={`New ${label} trait`}
          className="h-9"
        />
        <Button
          type="button"
          onClick={onAdd}
          disabled={!draft.trim() || isAdding}
          className="h-9 shrink-0"
        >
          <Plus className="size-4 mr-1" /> Add
        </Button>
      </div>
    </section>
  );
}
