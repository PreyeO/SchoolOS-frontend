"use client";

import { useQuery } from "@tanstack/react-query";

import { getScores, getSubmission } from "../api/results-api";
import type { ScoreFilters } from "../types";

// Keyed under a "results" root so phase 2 can persist the whole prefix for
// offline score entry the way "attendance" is persisted today.
export const SCORES_QUERY_KEY = ["results", "scores"];
export const SUBMISSION_QUERY_KEY = ["results", "submission"];

function ready(filters: Partial<ScoreFilters>): filters is ScoreFilters {
  return !!filters.class_arm_id && !!filters.subject_id && !!filters.academic_period_id;
}

export function useScores(filters: Partial<ScoreFilters>) {
  return useQuery({
    queryKey: [...SCORES_QUERY_KEY, filters],
    queryFn: () => getScores(filters as ScoreFilters),
    enabled: ready(filters),
  });
}

export function useSubmission(filters: Partial<ScoreFilters>) {
  return useQuery({
    queryKey: [...SUBMISSION_QUERY_KEY, filters],
    queryFn: () => getSubmission(filters as ScoreFilters),
    enabled: ready(filters),
  });
}
