"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";

import { createFeeItem, getFeeItems } from "../api/fee-items-api";
import { planClassCopy, type FeeLine } from "../lib/fee-copy";
import { FEE_ITEMS_QUERY_KEY } from "./use-fee-items";

export interface CopyTargetClass {
  classId: string;
  label: string;
}

export interface ClassCopyResult {
  label: string;
  added: number;
  skipped: string[];
  error?: string;
}

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : word.endsWith("s") ? "es" : "s"}`;
}

// Copies one class's fees for a term onto other classes, same term. No bulk
// route exists, so each class is read fresh (what it already bills decides
// what's skipped) and then given one create per missing fee. A failure stops
// only that class; the rest carry on, and nothing is rolled back.
export function useCopyFeeItems() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ lines, targets, periodId }: { lines: FeeLine[]; targets: CopyTargetClass[]; periodId: string }) => {
      const results: ClassCopyResult[] = [];
      for (const t of targets) {
        const result: ClassCopyResult = { label: t.label, added: 0, skipped: [] };
        try {
          const plan = planClassCopy(lines, await getFeeItems(t.classId, periodId));
          result.skipped = plan.skipped;
          for (const line of plan.toCreate) {
            await createFeeItem({ klass_id: t.classId, academic_period_id: periodId, ...line });
            result.added += 1;
          }
        } catch (error) {
          result.error = getErrorMessage(error);
        }
        results.push(result);
      }
      return results;
    },
    onSuccess: (results) => {
      const added = results.reduce((n, r) => n + r.added, 0);
      const skipped = results.reduce((n, r) => n + r.skipped.length, 0);
      const reached = results.filter((r) => !r.error).length;
      if (reached) {
        const note = skipped ? ` Skipped ${plural(skipped, "fee")} a class already had (amounts unchanged).` : "";
        toast.success(`Copied to ${plural(reached, "class")}: ${plural(added, "fee")} added.${note}`);
      }
      for (const r of results.filter((x) => x.error)) {
        toast.error(`${r.label}: ${r.error}${r.added ? ` (${plural(r.added, "fee")} added before this)` : ""}`);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: [FEE_ITEMS_QUERY_KEY] }),
  });
}
