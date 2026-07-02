"use client";

import { useQuery } from "@tanstack/react-query";

import { getRecentActivity } from "../api/dashboard-activity-api";

export function useActivityFeed() {
  return useQuery({
    queryKey: ["dashboard", "recent-activity"],
    queryFn: getRecentActivity,
  });
}
