"use client";

import { useState } from "react";
import { Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { SchoolLevelValue } from "@/data/school-levels";

import type { GradingSystem } from "../../api/grading-api";
import { useApplyGradingToLevels } from "../../hooks/use-grading-mutations";
import { copyTargets, levelLabel, systemToValues, toContent } from "../../lib/grading-copy";

interface Props {
  source: GradingSystem;
  systems: GradingSystem[];
  schoolLevels: SchoolLevelValue[];
}

// Copies one level's components and grade scale to other levels. A level
// without grading gets it created; one that has grading gets it replaced, so
// those start unticked and say so: nothing is overwritten unless chosen.
export function CopyToLevelsDialog({ source, systems, schoolLevels }: Props) {
  const targets = copyTargets(source.level, schoolLevels, systems);
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<Set<SchoolLevelValue>>(new Set());
  const apply = useApplyGradingToLevels();
  const from = levelLabel(source.level);

  if (targets.length === 0) return null;

  function openDialog() {
    setPicked(new Set(targets.filter((t) => !t.systemId).map((t) => t.level)));
    setOpen(true);
  }

  const chosen = targets.filter((t) => picked.has(t.level));
  const replacing = chosen.filter((t) => t.systemId).length;

  return (
    <>
      <Button type="button" variant="ghost" size="sm" className="h-8 text-xs" onClick={openDialog}>
        <Copy className="size-3.5" aria-hidden /> Copy to other levels
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Copy {from} grading to other levels</DialogTitle>
            <DialogDescription>Its components and grade scale are copied exactly. You can edit any level afterwards.</DialogDescription>
          </DialogHeader>
          <fieldset className="space-y-2">
            <legend className="sr-only">Levels to copy to</legend>
            {targets.map((t) => (
              <label key={t.level} className="flex cursor-pointer items-start gap-3 rounded-xl border border-n-200 p-3 has-checked:border-primary has-checked:bg-primary/5">
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 accent-primary"
                  checked={picked.has(t.level)}
                  onChange={(e) =>
                    setPicked((prev) => {
                      const next = new Set(prev);
                      if (e.target.checked) next.add(t.level);
                      else next.delete(t.level);
                      return next;
                    })
                  }
                />
                <span>
                  <span className="block text-sm font-medium text-ink">{levelLabel(t.level)}</span>
                  <span className="block text-xs text-n-500">
                    {t.systemId ? "Has its own grading: this replaces it" : "No grading yet"}
                  </span>
                </span>
              </label>
            ))}
          </fieldset>
          {replacing > 0 && (
            <p className="text-xs text-n-600">
              {replacing} level{replacing === 1 ? "'s" : "s'"} current grading will be replaced. Scores already entered
              keep their marks.
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              type="button"
              disabled={chosen.length === 0 || apply.isPending}
              onClick={() =>
                apply.mutate(
                  { targets: chosen, content: toContent(systemToValues(source)) },
                  { onSuccess: () => setOpen(false) },
                )
              }
            >
              {apply.isPending ? "Copying…" : `Copy to ${chosen.length} level${chosen.length === 1 ? "" : "s"}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
