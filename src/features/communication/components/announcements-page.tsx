"use client";

import { useMemo, useState } from "react";
import { Megaphone, Plus } from "lucide-react";

import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { useHasSchoolPermission } from "@/lib/auth/use-school-permission";
import { groupByDay } from "@/lib/text/group-by-day";
import { useAuthStore } from "@/stores/auth-store";

import { useAnnouncements, useCreateAnnouncement } from "../hooks/use-announcements";
import { reachesViewer } from "../lib/audiences";
import { AnnouncementCard } from "./announcement-card";
import { AnnouncementDialog } from "./announcement-dialog";
import { AnnouncementFilters } from "./announcement-filters";

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
  const [categoryFilter, setCategoryFilter] = useState("");

  const personas = useMemo(() => claims?.personas ?? [], [claims]);

  // Both filters run client-side. The endpoint does now support ?category=,
  // but the whole list is already fetched in one page_size=100 request for the
  // audience filter — which has no server equivalent — so filtering the same
  // array twice is one request instead of two and both toggles stay instant.
  // Switch category to the server filter if this ever needs real pagination.
  //
  // Only worth offering to a manager: everyone else's list is already narrowed
  // to notices aimed at them.
  const visible = useMemo(() => {
    if (!announcements) return [];
    return announcements.filter(
      (a) =>
        (!audienceFilter || a.audience_personas.includes(audienceFilter as never)) &&
        (!categoryFilter || a.category === categoryFilter),
    );
  }, [announcements, audienceFilter, categoryFilter]);

  // Safe to group in a single pass: the backend orders by -created_at and the
  // filters above only remove items, so the run order is preserved.
  const days = useMemo(() => groupByDay(visible), [visible]);

  // Distinguishes "this school has posted nothing" from "your filters hid
  // everything" — the two need opposite advice, and a compose CTA under the
  // second one would be wrong.
  const filtered = !!audienceFilter || !!categoryFilter;

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
        <AnnouncementFilters
          audience={audienceFilter}
          onAudienceChange={setAudienceFilter}
          category={categoryFilter}
          onCategoryChange={setCategoryFilter}
        />
      )}

      {isPending ? (
        <p className="text-sm text-n-400" role="status">Loading notices…</p>
      ) : isError ? (
        <ErrorState error={error} resourceLabel="announcements" />
      ) : visible.length === 0 ? (
        <div className="rounded-xl border border-n-200 bg-white px-6 py-12 text-center">
          <Megaphone className="mx-auto size-6 text-n-300" />
          <p className="mt-3 text-sm font-medium text-ink">
            {filtered ? "Nothing matches those filters" : "No announcements yet"}
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm text-n-500">
            {filtered
              ? "Try widening the audience or the kind of notice."
              : canManage
                ? "Post one to tell staff, parents or students what's happening."
                : "When your school posts a notice for you, it shows up here."}
          </p>
          {canManage && !filtered && <div className="mt-4">{composeButton}</div>}
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
