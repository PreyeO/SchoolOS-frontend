import { apiClient } from "@/lib/api/client";
import { ANNOUNCEMENT_ENDPOINTS } from "@/lib/api/endpoints";
import type { PaginatedResponse } from "@/lib/api/types";

import type {
  Announcement,
  CreateAnnouncementPayload,
  UpdateAnnouncementPayload,
} from "../types";

// The school's notices, newest first.
//
// What comes back depends on the caller, not on any parameter: a member holding
// post_notices gets every announcement in the school, everyone else gets only
// those aimed at a persona they hold. The endpoint takes no filter or search
// params at all, so any narrowing the UI offers has to happen client-side.
//
// page_size=100 with no pagination UI. A school posting more than 100 notices
// would be unusual, but this is the one list here that could plausibly grow past
// it over years — if it does, this needs real paging rather than a bigger page.
export async function getAnnouncements(): Promise<Announcement[]> {
  const { data } = await apiClient.get<PaginatedResponse<Announcement>>(
    ANNOUNCEMENT_ENDPOINTS.LIST(),
    { params: { page_size: 100 } },
  );
  return data.results;
}

// Requires post_notices. Live the moment it's created — there is no draft state
// to save into first.
//
// The response is the sanitized record, not an echo of what was sent: bleach
// strips anything outside the allowlist server-side. Callers should render from
// the response rather than the submitted draft.
export async function createAnnouncement(
  payload: CreateAnnouncementPayload,
): Promise<Announcement> {
  const { data } = await apiClient.post<Announcement>(ANNOUNCEMENT_ENDPOINTS.LIST(), payload);
  return data;
}

// PATCH, not PUT — the view passes partial=True and every field on the update
// serializer is optional, so send only what changed. audience_personas replaces
// the stored list outright when present.
//
// Any post_notices admin may edit, not only the author, so never gate this on
// created_by in the UI.
export async function updateAnnouncement(
  id: string,
  payload: UpdateAnnouncementPayload,
): Promise<Announcement> {
  const { data } = await apiClient.patch<Announcement>(
    ANNOUNCEMENT_ENDPOINTS.DETAIL(id),
    payload,
  );
  return data;
}

// Hard delete — nothing references an announcement, so there is no soft-delete
// or archive to fall back on. Confirm before calling.
export async function deleteAnnouncement(id: string): Promise<void> {
  await apiClient.delete(ANNOUNCEMENT_ENDPOINTS.DETAIL(id));
}
