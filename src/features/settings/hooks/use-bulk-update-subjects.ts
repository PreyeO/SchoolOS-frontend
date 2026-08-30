"use client";

import { useMutationWithToast } from "@/lib/api/use-mutation-with-toast";

import { bulkUpdateSubjects } from "../api/subjects-api";
import type { BulkUpdateItem } from "../lib/subject-bulk-edit";

// The toast says how many, because the whole point of this screen is that one
// save covers many rows — "Saved" alone wouldn't confirm the scale of what
// just happened. The call is atomic server-side, so the count is exact.
export function useBulkUpdateSubjects(count: number) {
  return useMutationWithToast(
    (subjects: BulkUpdateItem[]) => bulkUpdateSubjects(subjects),
    count === 1 ? "1 subject updated" : `${count} subjects updated`,
  );
}
