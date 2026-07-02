"use client";

import { useQuery } from "@tanstack/react-query";

import { getUpcomingEvents } from "../api/dashboard-activity-api";

export function useUpcomingEvents() {
  return useQuery({
    queryKey: ["dashboard", "upcoming-events"],
    queryFn: getUpcomingEvents,
  });
}
