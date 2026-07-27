"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";
import { ROLES_QUERY_KEY } from "@/features/invitations/hooks/use-roles";

import { createRole, deleteRole, updateRole, type RolePayload } from "../api/roles-api";

// Not using the shared useMutationWithToast factory — that one invalidates
// onboarding review + academic-structure, neither of which roles touch.
// Roles have their own query key, shared with the invite-admin role picker.
function useRoleMutation<TArgs>(mutationFn: (args: TArgs) => Promise<unknown>, successMessage: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ROLES_QUERY_KEY });
      toast.success(successMessage);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useCreateRole() {
  return useRoleMutation((payload: RolePayload) => createRole(payload), "Role added");
}

export function useUpdateRole() {
  return useRoleMutation(
    ({ id, payload }: { id: string; payload: Partial<RolePayload> }) => updateRole(id, payload),
    "Saved",
  );
}

export function useDeleteRole() {
  return useRoleMutation((id: string) => deleteRole(id), "Removed");
}
