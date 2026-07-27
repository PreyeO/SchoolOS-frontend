"use client";

import { Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { cn } from "@/lib/utils";

export interface SubjectRowData {
  id: string;
  name: string;
  is_core: boolean;
  selected: boolean;
}

interface Props {
  entry: SubjectRowData;
  onToggle: () => void;
  onRename: (name: string) => void;
  onToggleCore: () => void;
  onRemove: () => void;
}

// Compact chip — sized to sit several-per-row in a grid (see step-subjects.tsx)
// rather than stacked one-per-line, so the level's full list fits without its
// own inner scroll.
export function SubjectRow({ entry, onToggle, onRename, onToggleCore, onRemove }: Props) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-n-200 py-1 pr-1.5 pl-2">
      <input
        type="checkbox"
        className="accent-brand shrink-0"
        checked={entry.selected}
        onChange={onToggle}
        aria-label={`Include ${entry.name}`}
      />
      <Input
        className="h-6 min-w-0 flex-1 border-none px-1 text-xs shadow-none focus-visible:ring-0"
        value={entry.name}
        onChange={(e) => onRename(e.target.value)}
      />
      <button
        type="button"
        onClick={onToggleCore}
        aria-pressed={entry.is_core}
        aria-label={entry.is_core ? `${entry.name} is a core subject` : `Mark ${entry.name} as core`}
        title={entry.is_core ? "Core subject" : "Mark as core"}
        className={cn(
          "size-5 shrink-0 rounded-full border text-[9px] font-semibold transition-colors",
          entry.is_core ? "border-brand/30 bg-brand/10 text-brand" : "border-n-200 text-n-400 hover:border-n-300",
        )}
      >
        C
      </button>
      <ConfirmDeleteDialog
        trigger={
          <button
            type="button"
            className="shrink-0 text-n-400 transition-colors hover:text-clay"
            aria-label={`Remove ${entry.name}`}
          >
            <Trash2 className="size-3.5" />
          </button>
        }
        title={`Remove ${entry.name || "this subject"}?`}
        confirmLabel="Remove"
        onConfirm={onRemove}
      />
    </div>
  );
}
