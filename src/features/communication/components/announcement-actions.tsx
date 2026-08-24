"use client";

import { Pencil, Trash2 } from "lucide-react";

import { ConfirmDeleteDialog } from "@/components/shared/confirm-delete-dialog";
import { Button } from "@/components/ui/button";

import { useDeleteAnnouncement, useUpdateAnnouncement } from "../hooks/use-announcements";
import type { Announcement } from "../types";
import { AnnouncementDialog } from "./announcement-dialog";

// Edit and delete for one notice. Rendered only for a caller holding
// post_notices — and available to ANY such admin, not just the author, which is
// how the backend gates it too.
//
// Split out of AnnouncementCard when the category badge pushed it over the
// 150-line limit; the card is now purely presentation plus this.
export function AnnouncementActions({ announcement }: { announcement: Announcement }) {
  const updateAnnouncement = useUpdateAnnouncement();
  const deleteAnnouncement = useDeleteAnnouncement();

  return (
    <span className="inline-flex shrink-0 items-center gap-1">
      <AnnouncementDialog
        trigger={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Edit ${announcement.title}`}
          >
            <Pencil className="size-3.5" />
          </Button>
        }
        title="Edit notice"
        submitLabel="Save"
        initialValues={{
          title: announcement.title,
          body_html: announcement.body_html,
          audience_personas: announcement.audience_personas,
          category: announcement.category,
        }}
        isPending={updateAnnouncement.isPending}
        onSave={(values) => updateAnnouncement.mutateAsync({ id: announcement.id, payload: values })}
      />
      <ConfirmDeleteDialog
        trigger={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={`Delete ${announcement.title}`}
          >
            <Trash2 className="size-3.5" />
          </Button>
        }
        title={`Delete "${announcement.title}"?`}
        description="This can't be undone — there's no archive to restore it from, and it disappears for everyone who could see it."
        isPending={deleteAnnouncement.isPending}
        onConfirm={() =>
          deleteAnnouncement.mutate({ id: announcement.id, title: announcement.title })
        }
      />
    </span>
  );
}
