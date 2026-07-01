"use client";

import { Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
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

export function SubjectRow({ entry, onToggle, onRename, onToggleCore, onRemove }: Props) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-n-200 pl-2.5 pr-2 py-1.5">
      <input
        type="checkbox"
        className="accent-brand shrink-0"
        checked={entry.selected}
        onChange={onToggle}
        aria-label={`Include ${entry.name}`}
      />
      <Input
        className="h-7 flex-1 border-none px-1 text-sm shadow-none focus-visible:ring-0"
        value={entry.name}
        onChange={(e) => onRename(e.target.value)}
      />
      <button
        type="button"
        onClick={onToggleCore}
        aria-pressed={entry.is_core}
        title={entry.is_core ? "Core subject" : "Mark as core"}
        className={cn(
          "shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors",
          entry.is_core
            ? "border-brand/30 bg-brand/10 text-brand"
            : "border-n-200 text-n-400 hover:border-n-300",
        )}
      >
        Core
      </button>
      <button
        type="button"
        onClick={onRemove}
        className="shrink-0 text-n-400 transition-colors hover:text-clay"
        aria-label={`Remove ${entry.name}`}
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}
