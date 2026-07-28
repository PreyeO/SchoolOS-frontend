import { apiClient } from "@/lib/api/client";
import { PARENT_STUDENT_LINK_ENDPOINTS } from "@/lib/api/endpoints";

import type { CreateParentStudentLinkPayload } from "../types";

export async function createParentStudentLink(payload: CreateParentStudentLinkPayload): Promise<void> {
  await apiClient.post(PARENT_STUDENT_LINK_ENDPOINTS.LIST(), payload);
}

export async function deleteParentStudentLink(id: string): Promise<void> {
  await apiClient.delete(PARENT_STUDENT_LINK_ENDPOINTS.DETAIL(id));
}
