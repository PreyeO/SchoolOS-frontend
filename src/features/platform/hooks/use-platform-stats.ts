"use client";

import { useQuery } from "@tanstack/react-query";

import { getDemoPipeline, getPlatformHeadcounts } from "../api/platform-stats-api";

// Under the same "platform" prefix as every other platform query, so
// useExtendAccess's invalidation and logout both reach them.
export function usePlatformHeadcounts() {
  return useQuery({ queryKey: ["platform", "headcounts"], queryFn: getPlatformHeadcounts });
}

export function useDemoPipeline() {
  return useQuery({ queryKey: ["platform", "demo-pipeline"], queryFn: getDemoPipeline });
}
