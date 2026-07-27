"use client";

import { useQuery } from "@tanstack/react-query";

import { getRoles } from "../api/invitations-api";

// Exported so Settings' role CRUD mutations can invalidate this exact list —
// both the invite-admin role picker and the Roles & Permissions settings
// page read the same set of roles.
export const ROLES_QUERY_KEY = ["invitations", "roles"];

export function useRoles() {
  return useQuery({
    queryKey: ROLES_QUERY_KEY,
    queryFn: getRoles,
  });
}
