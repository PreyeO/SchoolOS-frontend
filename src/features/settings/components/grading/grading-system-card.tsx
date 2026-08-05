"use client";

import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { SCHOOL_LEVELS } from "@/data/school-levels";

import type { GradingSystem } from "../../api/grading-api";
import { useDeleteGradingSystem, useUpdateGradingSystem } from "../../hooks/use-grading-mutations";
import { GradingFormDialog } from "./grading-form-dialog";

export function GradingSystemCard({ system }: { system: GradingSystem }) {
  const updateSystem = useUpdateGradingSystem();
  const deleteSystem = useDeleteGradingSystem();
  const levelLabel = SCHOOL_LEVELS.find((l) => l.value === system.level)?.label ?? system.level;

  const sortedComponents = [...system.components].sort((a, b) => a.order - b.order);
  const sortedRanges = [...system.ranges].sort((a, b) => b.max_score - a.max_score);

  return (
    <div className="rounded-xl border border-n-200 bg-white p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="font-semibold text-ink">{system.name ?? `${levelLabel} Grading`}</p>
          <p className="text-xs text-n-400">{levelLabel}</p>
        </div>
        <span className="flex shrink-0 items-center gap-1">
          <GradingFormDialog
            title="Edit grading system"
            initialValues={{
              level: system.level,
              components: sortedComponents.map((c) => ({ name: c.name, max_obtainable: c.max_obtainable })),
              ranges: sortedRanges.map((r) => ({
                grade: r.grade,
                min_score: r.min_score,
                max_score: r.max_score,
                remark: r.remark ?? "",
              })),
            }}
            isPending={updateSystem.isPending}
            onSave={(values) =>
              updateSystem.mutateAsync({
                id: system.id,
                payload: {
                  components: values.components.map((c, i) => ({ ...c, order: i + 1 })),
                  ranges: values.ranges,
                },
              })
            }
            trigger={
              <Button type="button" variant="ghost" size="icon-sm" aria-label={`Edit ${levelLabel} grading system`}>
                <Pencil className="size-3.5" />
              </Button>
            }
          />
          <ConfirmDeleteDialog
            trigger={
              <Button type="button" variant="ghost" size="icon-sm" aria-label={`Delete ${levelLabel} grading system`}>
                <Trash2 className="size-3.5" />
              </Button>
            }
            title={`Delete the ${levelLabel} grading system?`}
            description="This removes its components and grade ranges. This can't be undone."
            isPending={deleteSystem.isPending}
            onConfirm={() => deleteSystem.mutate(system.id)}
          />
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-n-400">Components</p>
          <ul className="space-y-1">
            {sortedComponents.map((c) => (
              <li key={c.id} className="flex justify-between text-sm">
                <span className="text-ink">{c.name}</span>
                <span className="text-n-500">{c.max_obtainable}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-n-400">Grade ranges</p>
          <ul className="space-y-1">
            {sortedRanges.map((r) => (
              <li key={r.id} className="flex justify-between text-sm">
                <span className="text-ink">
                  {r.grade}{" "}
                  <span className="text-n-400">
                    ({r.min_score}–{r.max_score})
                  </span>
                </span>
                <span className="text-n-500">{r.remark}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
