"use client";

import { useQuery } from "@tanstack/react-query";

import { getRoles } from "../api/invitations-api";

export function useRoles() {
  return useQuery({
    queryKey: ["invitations", "roles"],
    queryFn: getRoles,
  });
}
