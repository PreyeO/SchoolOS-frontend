"use client";

import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";

import {
  bulkRateStudents,
  createTraits,
  deleteTrait,
  getRemarks,
  getTraitRatings,
  getTraits,
  setClassTeacherRemark,
  setPrincipalRemark,
  updateTrait,
} from "../api/traits-api";
import type {
  BulkTraitRatingPayload,
  BulkTraitRatingResponse,
  CreateTraitsPayload,
  SetRemarkPayload,
} from "../types";

// Under the persisted "results" root, so behaviour rating works offline for the
// same reason score entry does.
export const TRAITS_QUERY_KEY = ["results", "traits"];
export const TRAIT_RATINGS_QUERY_KEY = ["results", "trait-ratings"];
export const REMARKS_QUERY_KEY = ["results", "remarks"];

export function useTraits() {
  return useQuery({ queryKey: TRAITS_QUERY_KEY, queryFn: getTraits });
}

export function useTraitRatings(
  classArmId: string | null | undefined,
  academicPeriodId: string | null | undefined,
) {
  return useQuery({
    queryKey: [...TRAIT_RATINGS_QUERY_KEY, classArmId, academicPeriodId],
    queryFn: () => getTraitRatings(classArmId as string, academicPeriodId as string),
    enabled: !!classArmId && !!academicPeriodId,
  });
}

export function useRemarks(
  classArmId: string | null | undefined,
  academicPeriodId: string | null | undefined,
) {
  return useQuery({
    queryKey: [...REMARKS_QUERY_KEY, classArmId, academicPeriodId],
    queryFn: () => getRemarks(classArmId as string, academicPeriodId as string),
    enabled: !!classArmId && !!academicPeriodId,
  });
}

// ── Rating: the second offline surface ──────────────────────────────────────
//
// Same treatment as score entry, and for the same reason: TraitRatingService
// upserts on (student, trait, academic_period) and resolves conflicts by the
// client's marked_at. Behaviour is judged in the classroom, so it has to survive
// having no signal there.
export const TRAIT_RATING_MUTATION_KEY = ["results", "bulk-rate"] as const;

export function registerTraitRatingDefaults(queryClient: QueryClient): void {
  queryClient.setMutationDefaults<BulkTraitRatingResponse, Error, BulkTraitRatingPayload>(
    TRAIT_RATING_MUTATION_KEY,
    {
      mutationFn: (payload) => bulkRateStudents(payload),
      onSuccess: (result) => {
        queryClient.invalidateQueries({ queryKey: ["results"] });
        if (result.skipped.length > 0) {
          toast.warning(
            `Saved ${result.applied.length}. ${result.skipped.length} skipped — a newer rating already exists.`,
          );
          return;
        }
        toast.success(
          `Saved ${result.applied.length} rating${result.applied.length === 1 ? "" : "s"}.`,
        );
      },
      onError: (error) => {
        toast.error(getErrorMessage(error));
      },
    },
  );
}

export function useBulkRate() {
  return useMutation<BulkTraitRatingResponse, Error, BulkTraitRatingPayload>({
    mutationKey: TRAIT_RATING_MUTATION_KEY,
  });
}

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
