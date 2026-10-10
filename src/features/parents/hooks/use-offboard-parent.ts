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
      queryClient.invalidateQueries({ queryKey: ["parents"] });
      // Their children's detail pages show the link, now badged "Former".
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Parent offboarded");
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
