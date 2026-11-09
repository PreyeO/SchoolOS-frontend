"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";

import {
  commitContactImport,
  createGuardianContact,
  deleteGuardianContact,
  getGuardianContacts,
  previewContactImport,
  updateGuardianContact,
  type ContactFilters,
} from "../api/guardian-contacts-api";
import type { UpdateContactPayload } from "../types";

// Not in query-persistence's allowlist: parents' phone numbers have no
// business sitting in a shared staffroom browser's storage.
export const GUARDIAN_CONTACTS_KEY = ["guardian-contacts"] as const;

export function useGuardianContacts(filters: ContactFilters) {
  return useQuery({
    queryKey: [...GUARDIAN_CONTACTS_KEY, filters],
    queryFn: () => getGuardianContacts(filters),
    placeholderData: keepPreviousData,
  });
}

// Every write can move the primary flag on OTHER rows (the server demotes the
// previous primary), so refetch the lists rather than patch one row in cache.
function useContactMutation<TVars, TData>(fn: (vars: TVars) => Promise<TData>, success: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    networkMode: "always",
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: GUARDIAN_CONTACTS_KEY });
      toast.success(success);
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCreateContact() {
  return useContactMutation(createGuardianContact, "Number saved.");
}

export function useUpdateContact() {
  return useContactMutation(
    ({ id, ...payload }: UpdateContactPayload & { id: string }) => updateGuardianContact(id, payload),
    "Number updated.",
  );
}

export function useDeleteContact() {
  return useContactMutation(deleteGuardianContact, "Number removed.");
}

export function usePreviewContactImport() {
  return useMutation({
    mutationFn: previewContactImport,
    networkMode: "always",
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

export function useCommitContactImport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: commitContactImport,
    networkMode: "always",
    onSuccess: () => queryClient.invalidateQueries({ queryKey: GUARDIAN_CONTACTS_KEY }),
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}
