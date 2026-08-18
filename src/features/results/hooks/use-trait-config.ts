"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";

import {
  createTraits,
  deleteTrait,
  setClassTeacherRemark,
  setPrincipalRemark,
  updateTrait,
} from "../api/traits-api";
import type { CreateTraitsPayload, SetRemarkPayload } from "../types";

// ── Admin trait config, and remarks: online only ────────────────────────────

function useResultsMutation<TArgs, TResult>(
  fn: (args: TArgs) => Promise<TResult>,
  successMessage: string,
) {
  const queryClient = useQueryClient();
  return useMutation<TResult, Error, TArgs>({
    mutationFn: fn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["results"] });
      toast.success(successMessage);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCreateTraits() {
  return useResultsMutation((payload: CreateTraitsPayload) => createTraits(payload), "Traits added");
}

export function useUpdateTrait() {
  return useResultsMutation(
    ({ id, ...payload }: { id: string; name?: string; order?: number }) => updateTrait(id, payload),
    "Trait updated",
  );
}

// The backend deletes outright only when nothing references the trait; otherwise
// it deactivates so historical report cards keep their wording. The copy stays
// vague on purpose rather than promising one or the other.
export function useDeleteTrait() {
  return useResultsMutation((id: string) => deleteTrait(id), "Trait removed");
}

// No marked_at on either remark — the server stamps *_remark_at — so there's no
// conflict rule to replay against and these stay online-only.
export function useSetClassTeacherRemark() {
  return useResultsMutation(
    (payload: SetRemarkPayload) => setClassTeacherRemark(payload),
    "Remark saved",
  );
}

export function useSetPrincipalRemark() {
  return useResultsMutation(
    (payload: SetRemarkPayload) => setPrincipalRemark(payload),
    "Remark saved",
  );
}
