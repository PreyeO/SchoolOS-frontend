"use client";

import { useMemo, useState } from "react";
import { Megaphone, Plus } from "lucide-react";

import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { useHasSchoolPermission } from "@/lib/auth/use-school-permission";
import { groupByDay } from "@/lib/text/group-by-day";
import { useAuthStore } from "@/stores/auth-store";

import { useAnnouncements, useCreateAnnouncement } from "../hooks/use-announcements";
import { ANNOUNCEMENT_AUDIENCES, reachesViewer } from "../lib/audiences";
import { AnnouncementCard } from "./announcement-card";
import { AnnouncementDialog } from "./announcement-dialog";

// One screen serving two jobs, because the API serves two lists from one route.
//
// A member holding post_notices gets every notice in the school plus compose,
// edit and delete. Everyone else gets a read-only inbox the server has already
// filtered to notices aimed at a persona they hold — so there is nothing to
// hide client-side, and admins who also teach still see their own notices here
// rather than being sent somewhere separate.
export function AnnouncementsPage() {
  const { data: announcements, isPending, isError, error } = useAnnouncements();
  const canManage = useHasSchoolPermission("post_notices");
  const createAnnouncement = useCreateAnnouncement();
  const claims = useAuthStore((s) => s.claims);
  const [audienceFilter, setAudienceFilter] = useState("");

  const personas = useMemo(() => claims?.personas ?? [], [claims]);

  // Client-side because the endpoint takes no filter params at all. Only worth
  // offering to a manager: everyone else's list is already narrowed to them.
  const visible = useMemo(() => {
    if (!announcements) return [];
    if (!audienceFilter) return announcements;
    return announcements.filter((a) => a.audience_personas.includes(audienceFilter as never));
  }, [announcements, audienceFilter]);

  // Safe to group in a single pass: the backend orders by -created_at and the
  // audience filter above only removes items, so the run order is preserved.
  const days = useMemo(() => groupByDay(visible), [visible]);

  const composeButton = (
    <AnnouncementDialog
      trigger={
        <Button type="button" size="sm">
          <Plus className="size-4 mr-1" /> New notice
        </Button>
      }
      title="Post a notice"
      submitLabel="Post"
      isPending={createAnnouncement.isPending}
      onSave={(values) => createAnnouncement.mutateAsync(values)}
    />
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">Announcements</h1>
          <p className="mt-1 text-sm text-n-500">
            {canManage
              ? "Every notice posted in this school, and who each one reaches."
              : "Notices posted for you."}
          </p>
        </div>
        {canManage && composeButton}
      </div>

      {canManage && (announcements?.length ?? 0) > 0 && (
        <label className="flex items-center gap-2 text-sm">
          <span className="text-n-500">Audience</span>
          <Select
            value={audienceFilter}
            onChange={(e) => setAudienceFilter(e.target.value)}
            aria-label="Filter by audience"
            className="min-w-40"
          >
            <option value="">All notices</option>
            {ANNOUNCEMENT_AUDIENCES.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </Select>
        </label>
      )}

      {isPending ? (
        <p className="text-sm text-n-400" role="status">Loading notices…</p>
      ) : isError ? (
        <ErrorState error={error} resourceLabel="announcements" />
      ) : visible.length === 0 ? (
        <div className="rounded-xl border border-n-200 bg-white px-6 py-12 text-center">
          <Megaphone className="mx-auto size-6 text-n-300" />
          <p className="mt-3 text-sm font-medium text-ink">
            {audienceFilter ? "No notices for that audience" : "No announcements yet"}
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm text-n-500">
            {audienceFilter
              ? "Nothing has been posted to them yet."
              : canManage
                ? "Post one to tell staff, parents or students what's happening."
                : "When your school posts a notice for you, it shows up here."}
          </p>
          {canManage && !audienceFilter && <div className="mt-4">{composeButton}</div>}
        </div>
      ) : (
        <div className="space-y-6">
          {days.map((day) => (
            <section key={day.key}>
              <h2 className="mb-2 font-mono text-[11px] uppercase tracking-[0.15em] text-n-400">
                {day.label}
              </h2>
              <div className="space-y-3">
                {day.items.map((announcement) => (
                  <AnnouncementCard
                    key={announcement.id}
                    announcement={announcement}
                    canManage={canManage}
                    reachesMe={reachesViewer(announcement.audience_personas, personas)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
