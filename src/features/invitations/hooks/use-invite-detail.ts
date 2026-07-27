"use client";

import { useQuery } from "@tanstack/react-query";

import { getInviteDetail } from "../api/invitations-api";

export function useInviteDetail(token: string) {
  return useQuery({
    queryKey: ["invitations", "detail", token],
    queryFn: () => getInviteDetail(token),
    // An invalid/expired/used token is a definitive failure, not a transient
    // one — retrying it just delays showing the error.
    retry: false,
  });
}
