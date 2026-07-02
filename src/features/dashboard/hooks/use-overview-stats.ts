"use client";

import { useQuery } from "@tanstack/react-query";

import { getOverviewStats, getTrialStatus } from "../api/dashboard-api";

export function useOverviewStats() {
  return useQuery({
    queryKey: ["dashboard", "overview-stats"],
    queryFn: getOverviewStats,
  });
}

export function useTrialStatus() {
  return useQuery({
    queryKey: ["dashboard", "trial-status"],
    queryFn: getTrialStatus,
  });
}
