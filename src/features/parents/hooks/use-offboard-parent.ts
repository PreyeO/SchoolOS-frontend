"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";

import { offboardParent } from "../api/parents-api";

export function useOffboardParent(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reason: string) => offboardParent(id, reason),
    onSuccess: () => {
      // Stale-mark without refetching, as the teacher and admin offboards do.
      // The page's current-parent query is still mounted until it moves to
      // ?former=1, and that lookup now 404s: refetching it would flash
      // ErrorState before the redirect. The former lookup is a different key,
      // so it loads fresh anyway, and the lists refetch when they mount.
      queryClient.invalidateQueries({ queryKey: ["parents"], refetchType: "none" });
      // Their children's detail pages show the link, now badged "Former".
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Parent offboarded");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
