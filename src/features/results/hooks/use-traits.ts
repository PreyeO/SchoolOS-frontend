"use client";

import { useMutation, useQuery, type QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";

import { bulkRateStudents, getRemarks, getTraitRatings, getTraits } from "../api/traits-api";
import type { BulkTraitRatingPayload, BulkTraitRatingResponse } from "../types";

// Under the "results" root for invalidation, but note that only scores and
// submission are persisted for offline use — see PERSISTED_KEYS.
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

// ── Rating ──────────────────────────────────────────────────────────────────
//
// A keyed mutation with defaults, so a connection dropping mid-session pauses
// the batch rather than failing it. Deliberately NOT persisted, though: rating
// is term-end work done at a desk, and the screen it lives on also carries
// remarks, which have no client timestamp and so can never be queued. Making
// half a page work offline is worse than saying it needs a connection.
//
// The backend does support replay here (upsert on (student, trait, period),
// marked_at last-write-wins), so this is a product choice, not a limitation —
// adding ["results","trait-ratings"] and ["results","traits"] to PERSISTED_KEYS
// is all it would take to reverse.
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

// The admin trait config and the two remark mutations live in
// ./use-trait-config — they're online-only by design and share no state with
// the rating queue above.
export {
  useCreateTraits,
  useDeleteTrait,
  useSetClassTeacherRemark,
  useSetPrincipalRemark,
  useUpdateTrait,
} from "./use-trait-config";
