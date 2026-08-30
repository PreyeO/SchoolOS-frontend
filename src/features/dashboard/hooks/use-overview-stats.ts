"use client";

import { useQuery } from "@tanstack/react-query";

import { getOverviewStats } from "../api/dashboard-api";

export function useOverviewStats() {
  return useQuery({
    queryKey: ["dashboard", "overview-stats"],
    queryFn: getOverviewStats,
  });
}

