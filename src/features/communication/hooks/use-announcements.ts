"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/lib/api/get-error-message";

import {
  createAnnouncement,
  deleteAnnouncement,
  getAnnouncements,
  updateAnnouncement,
} from "../api/announcements-api";
import type { CreateAnnouncementPayload, UpdateAnnouncementPayload } from "../types";

// Its own prefix — announcements share nothing with academic structure or fees,
// so neither of those invalidations should reach them.
const ANNOUNCEMENTS_KEY = "announcements";

export function useAnnouncements() {
  return useQuery({
    queryKey: [ANNOUNCEMENTS_KEY, "list"],
    queryFn: getAnnouncements,
  });
}

function useAnnouncementMutation<TArgs, TResult>(
  mutationFn: (args: TArgs) => Promise<TResult>,
  successMessage: (result: TResult, args: TArgs) => string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (result, args) => {
      queryClient.invalidateQueries({ queryKey: [ANNOUNCEMENTS_KEY] });
      toast.success(successMessage(result, args));
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });
}

// "Posted", not "saved" — there is no draft state, so creating one publishes it
// to its audience immediately. The wording is the only warning anyone gets.
export function useCreateAnnouncement() {
  return useAnnouncementMutation(
    (payload: CreateAnnouncementPayload) => createAnnouncement(payload),
    () => "Notice posted",
  );
}

export function useUpdateAnnouncement() {
  return useAnnouncementMutation(
    ({ id, payload }: { id: string; payload: UpdateAnnouncementPayload }) =>
      updateAnnouncement(id, payload),
    () => "Notice updated",
  );
}

export function useDeleteAnnouncement() {
  return useAnnouncementMutation(
    ({ id }: { id: string; title: string }) => deleteAnnouncement(id),
    (_result, { title }) => `${title} deleted`,
  );
}
