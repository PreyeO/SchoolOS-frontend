"use client";

import { useQuery } from "@tanstack/react-query";

import { getOverviewCharts } from "../api/dashboard-charts-api";

export function useOverviewCharts() {
  return useQuery({
    queryKey: ["dashboard", "overview-charts"],
    queryFn: getOverviewCharts,
  });
}
