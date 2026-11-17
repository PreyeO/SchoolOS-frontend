"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { SchoolLevelValue } from "@/data/school-levels";
import { getErrorMessage } from "@/lib/api/get-error-message";

import { levelLabel, type CopyTarget, type GradingContent } from "../lib/grading-copy";

import {
  createGradingSystem,
  deleteGradingSystem,
  updateGradingSystem,
  type CreateGradingSystemPayload,
  type UpdateGradingSystemPayload,
} from "../api/grading-api";
import { GRADING_SYSTEMS_QUERY_KEY } from "./use-grading-systems";

// Not using the shared useMutationWithToast factory — that one invalidates
// onboarding review + academic-structure, neither of which grading systems
// are part of (grading isn't an onboarding step). Own query key instead.
function useGradingMutation<TArgs>(mutationFn: (args: TArgs) => Promise<unknown>, successMessage: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GRADING_SYSTEMS_QUERY_KEY });
      toast.success(successMessage);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useCreateGradingSystem() {
  return useGradingMutation(
    (payload: CreateGradingSystemPayload) => createGradingSystem(payload),
    "Grading system added",
  );
}

export function useUpdateGradingSystem() {
  return useGradingMutation(
    ({ id, payload }: { id: string; payload: UpdateGradingSystemPayload }) => updateGradingSystem(id, payload),
    "Saved",
  );
}

export function useDeleteGradingSystem() {
  return useGradingMutation((id: string) => deleteGradingSystem(id), "Removed");
}

export interface ApplyResult {
  level: SchoolLevelValue;
  ok: boolean;
  error?: string;
}

// One setup onto several levels: creates where a level has none, replaces
// where it has one. The backend has no bulk route, so it's one request per
// level, in turn, and each level's outcome is reported; one refusal doesn't
// stop the rest, and nothing is rolled back.
export function useApplyGradingToLevels() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ targets, content }: { targets: CopyTarget[]; content: GradingContent }) => {
      const results: ApplyResult[] = [];
      for (const t of targets) {
        try {
          if (t.systemId) await updateGradingSystem(t.systemId, content);
          else await createGradingSystem({ level: t.level, ...content });
          results.push({ level: t.level, ok: true });
        } catch (error) {
          results.push({ level: t.level, ok: false, error: getErrorMessage(error) });
        }
      }
      return results;
    },
    onSuccess: (results) => {
      const failed = results.filter((r) => !r.ok);
      const done = results.length - failed.length;
      if (done) toast.success(`Grading saved for ${done} level${done === 1 ? "" : "s"}.`);
      for (const f of failed) toast.error(`${levelLabel(f.level)}: ${f.error}`);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: GRADING_SYSTEMS_QUERY_KEY }),
  });
}
