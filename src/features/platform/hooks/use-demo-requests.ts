"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";

import { getDemoRequests, updateDemoRequestStatus } from "../api/demo-requests-api";
import type { DemoRequestFilters, DemoRequestStatus } from "../types-demo-requests";

const DEMO_REQUESTS_KEY = ["platform", "demo-requests"];

export function useDemoRequests(page: number, filters: DemoRequestFilters) {
  return useQuery({
    // Every filter in the key: two different filter sets are two different
    // results, and sharing a key would serve one for the other.
    queryKey: [...DEMO_REQUESTS_KEY, page, filters],
    queryFn: () => getDemoRequests(page, filters),
    placeholderData: (previous) => previous,
  });
}

export function useUpdateDemoRequestStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: DemoRequestStatus }) =>
      updateDemoRequestStatus(id, status),
    onSuccess: () => {
      // Invalidates every filter combination, not just the visible one: moving
      // a lead to "contacted" changes which of the status-filtered lists it
      // belongs to, so refreshing only the current view would leave the others
      // stale behind the filter chips.
      queryClient.invalidateQueries({ queryKey: DEMO_REQUESTS_KEY });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
