"use client";

import { useState } from "react";
import { Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ClassOptionGroup } from "@/lib/school/class-options";
import { formatNaira } from "@/lib/text/format-naira";

import { useCopyFeeItems } from "../hooks/use-copy-fee-items";
import { sameLevelClassIds, type FeeLine } from "../lib/fee-copy";

interface Props {
  lines: FeeLine[];
  sourceClassId: string;
  sourceLabel: string;
  termLabel: string;
  periodId: string;
  classGroups: ClassOptionGroup[];
}

// Copies the class in view's active fees for this term onto other classes,
// same term. Classes are grouped by level with a tick-all per level; the
// source's own level starts ticked. Only adds: a fee name a class already has
// is skipped and its amount kept, so nothing anyone set is overwritten.
export function CopyFeesDialog({ lines, sourceClassId, sourceLabel, termLabel, periodId, classGroups }: Props) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const copy = useCopyFeeItems();

  const groups = classGroups
    .map((g) => ({ ...g, options: g.options.filter((o) => o.classId !== sourceClassId) }))
    .filter((g) => g.options.length > 0);
  if (lines.length === 0 || groups.length === 0) return null;

  const total = lines.reduce((n, l) => n + l.amount, 0);
  const chosen = groups.flatMap((g) => g.options).filter((o) => picked.has(o.classId));

  function toggle(ids: string[], on: boolean) {
    setPicked((prev) => {
      const next = new Set(prev);
      for (const id of ids) {
        if (on) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }

  function openDialog() {
    setPicked(new Set(sameLevelClassIds(classGroups, sourceClassId)));
    setOpen(true);
  }

  return (
    <>
      <Button type="button" size="sm" variant="outline" onClick={openDialog}>
        <Copy className="size-4 mr-1" aria-hidden /> Copy to other classes
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] max-w-md overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Copy {sourceLabel}&rsquo;s fees</DialogTitle>
            <DialogDescription>
              {lines.length} fee{lines.length === 1 ? "" : "s"} ({formatNaira(total)}) for {termLabel}, copied to
              the same term. A fee a class already has (same name) is left as it is.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {groups.map((g) => {
              const ids = g.options.map((o) => o.classId);
              const all = ids.every((id) => picked.has(id));
              return (
                <fieldset key={g.level} className="space-y-1.5">
                  <legend className="flex w-full items-center justify-between text-xs font-medium uppercase tracking-wide text-n-400">
                    {g.levelLabel}
                    <button
                      type="button"
                      className="text-xs font-medium normal-case tracking-normal text-primary hover:underline"
                      onClick={() => toggle(ids, !all)}
                    >
                      {all ? "Clear" : "Select all"}
                    </button>
                  </legend>
                  <div className="grid grid-cols-2 gap-1.5">
                    {g.options.map((o) => (
                      <label
                        key={o.classId}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-n-200 px-3 py-2 text-sm text-ink has-checked:border-primary has-checked:bg-primary/5"
                      >
                        <input
                          type="checkbox"
                          className="size-4 accent-primary"
                          checked={picked.has(o.classId)}
                          onChange={(e) => toggle([o.classId], e.target.checked)}
                        />
                        {o.label}
                      </label>
                    ))}
                  </div>
                </fieldset>
              );
            })}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              type="button"
              disabled={chosen.length === 0 || copy.isPending}
              onClick={() =>
                copy.mutate(
                  { lines, periodId, targets: chosen.map((o) => ({ classId: o.classId, label: o.label })) },
                  { onSuccess: () => setOpen(false) },
                )
              }
            >
              {copy.isPending ? "Copying…" : `Copy to ${chosen.length} class${chosen.length === 1 ? "" : "es"}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
