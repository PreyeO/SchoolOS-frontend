"use client";

import { useQuery } from "@tanstack/react-query";

import { getSeatUsage } from "../api/seat-usage-api";

// Keyed under ["students"] on purpose: every mutation that changes the
// headcount (add, import, status change, delete) already invalidates that
// prefix, so the meter stays current without each one knowing it exists.
export function useSeatUsage(enabled: boolean) {
  return useQuery({
    queryKey: ["students", "seat-usage"],
    queryFn: getSeatUsage,
    enabled,
  });
}
