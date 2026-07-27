import { apiClient } from "@/lib/api/client";
import { ROLE_ENDPOINTS } from "@/lib/api/endpoints";
import type { Role } from "@/features/invitations/types";

// Re-exported so Settings hooks only ever import from this one api file —
// the list itself is shared with the invite-admin role picker.
export { getRoles } from "@/features/invitations/api/invitations-api";

export interface RolePayload {
  name: string;
  permissions: string[];
}

export async function getPermissionsCatalog(): Promise<string[]> {
  const { data } = await apiClient.get<{ permissions: string[] }>(ROLE_ENDPOINTS.PERMISSIONS());
  return data.permissions;
}

export async function createRole(payload: RolePayload): Promise<Role> {
  const { data } = await apiClient.post<Role>(ROLE_ENDPOINTS.LIST(), payload);
  return data;
}

export async function updateRole(id: string, payload: Partial<RolePayload>): Promise<Role> {
  const { data } = await apiClient.patch<Role>(ROLE_ENDPOINTS.DETAIL(id), payload);
  return data;
}

export async function deleteRole(id: string): Promise<void> {
  await apiClient.delete(ROLE_ENDPOINTS.DETAIL(id));
}
