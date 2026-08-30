"use client";

import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

interface Props {
  changeCount: number;
  errorCount: number;
  hiddenChanges: number;
  hiddenErrors: number;
  isPending: boolean;
  onDiscard: () => void;
  onSave: () => void;
}

function changeSummary(count: number, hidden: number): string {
  const base = count === 1 ? "1 subject changed" : `${count} subjects changed`;
  return hidden > 0 ? `${base} · ${hidden} not shown here` : base;
}

// Sticky because the list runs to ~100 subjects: the save has to stay reachable
// from wherever the user is editing, and the change count is the only running
// confirmation that their edits are being kept while they move between levels.
export function BulkEditSaveBar({
  changeCount,
  errorCount,
  hiddenChanges,
  hiddenErrors,
  isPending,
  onDiscard,
  onSave,
}: Props) {
  const blocked = errorCount > 0;

  return (
    <div className="sticky bottom-0 flex flex-wrap items-center gap-3 rounded-xl border border-n-200 bg-white px-4 py-3 shadow-sm">
      {blocked ? (
        <p role="alert" className="flex items-center gap-1.5 text-sm text-red-600">
          <AlertCircle className="size-4 shrink-0" />
          {errorCount === 1 ? "1 subject needs fixing" : `${errorCount} subjects need fixing`}
          {/* Otherwise the button is dead with nothing on screen explaining why. */}
          {hiddenErrors > 0 && " — clear the level filter and search to see them"}
        </p>
      ) : (
        <p className="text-sm text-n-600">
          {changeCount === 0 ? "No changes yet" : changeSummary(changeCount, hiddenChanges)}
        </p>
      )}

      <span className="ml-auto flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" onClick={onDiscard} disabled={isPending}>
          {changeCount === 0 ? "Done" : "Discard"}
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={onSave}
          disabled={isPending || blocked || changeCount === 0}
        >
          {isPending ? "Saving…" : "Save changes"}
        </Button>
      </span>
    </div>
  );
}
