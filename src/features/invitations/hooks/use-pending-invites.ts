"use client";

import { useQuery } from "@tanstack/react-query";

import { getPendingInvites } from "../api/invitations-api";
import type { PendingInvitesFilters } from "../types";

export const PENDING_INVITES_QUERY_KEY = ["invitations", "pending"];

export function usePendingInvites(filters: PendingInvitesFilters) {
  return useQuery({
    queryKey: [...PENDING_INVITES_QUERY_KEY, filters],
    queryFn: () => getPendingInvites(filters),
  });
}
