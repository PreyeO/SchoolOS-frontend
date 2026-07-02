"use client";

import { useQuery } from "@tanstack/react-query";

import { getNotifications } from "../api/dashboard-activity-api";

export function useNotifications() {
  return useQuery({
    queryKey: ["dashboard", "notifications"],
    queryFn: getNotifications,
  });
}
