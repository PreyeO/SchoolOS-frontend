"use client";

import { PersonAvatar } from "@/components/shared/person-avatar";
import { formatTimeOfDay } from "@/lib/text/format-time-of-day";

import { audienceLabel } from "../lib/audiences";
import { categoryMeta } from "../lib/categories";
import type { Announcement } from "../types";
import { AnnouncementActions } from "./announcement-actions";

interface Props {
  announcement: Announcement;
  canManage: boolean;
  // False when this notice isn't aimed at any persona the viewer holds. Only
  // ever happens for a manager, whose list carries the whole school.
  reachesMe: boolean;
}

// A notice reads as something a person posted, not a row in a table — hence the
// avatar leading the card and the author's name above the title rather than in
// small print beneath it.
//
// The date is deliberately absent: these are rendered inside day-grouped
// sections, so the header carries it and the card only needs the time. Same
// division the audit log uses.
export function AnnouncementCard({ announcement, canManage, reachesMe }: Props) {
  const author = announcement.created_by;
  // Null once the author's user record is removed. Fall back to a label rather
  // than rendering "undefined undefined" or an empty avatar.
  const byline = author ? `${author.first_name} ${author.last_name}` : "Removed user";
  const edited = announcement.updated_at !== announcement.created_at;
  const kind = categoryMeta(announcement.category);
  const KindIcon = kind.icon;

  return (
    // `general` contributes nothing here, so a routine notice keeps exactly the
    // card it had before categories existed. Only `urgent` changes the card
    // itself — the rest earn a badge and no more.
    <article
      className={`rounded-xl border p-4 transition-colors sm:p-5 ${
        kind.card || "border-n-200 bg-white hover:border-n-300"
      }`}
    >
      <div className="flex gap-3.5">
        <PersonAvatar
          firstName={author?.first_name ?? "?"}
          lastName={author?.last_name ?? ""}
          photo={author?.photo}
          className="mt-0.5 size-9 shrink-0"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
            <div className="min-w-0">
              <p className="text-xs text-n-500">
                <span className="font-medium text-n-600">{byline}</span>
                {" · "}
                {formatTimeOfDay(announcement.created_at)}
                {edited && <> · edited</>}
              </p>
              <h2 className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-display text-lg font-bold leading-tight text-ink">
                {announcement.title}
                {KindIcon && (
                  <span
                    // font-sans resets the display face inherited from the h2 —
                    // there is no `font-body` utility in this project.
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-sans text-[11px] font-medium ${kind.badge}`}
                  >
                    <KindIcon className="size-3" />
                    {kind.label}
                  </span>
                )}
              </h2>
            </div>

            {canManage && <AnnouncementActions announcement={announcement} />}
          </div>

          {/* Server-side bleach is the trust boundary: body_html has already
              been stripped to a fixed tag allowlist on every create and update,
              and this value came from that response. */}
          <div
            className="prose-announcement mt-2.5 text-sm text-n-600"
            dangerouslySetInnerHTML={{ __html: announcement.body_html }}
          />

          <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] uppercase tracking-wide text-n-400">To</span>
            {announcement.audience_personas.map((persona) => (
              <span
                key={persona}
                className="rounded-full bg-n-100 px-2 py-0.5 text-[11px] font-medium text-n-600"
              >
                {audienceLabel(persona)}
              </span>
            ))}
            {/* A manager sees every notice in the school, including ones
                addressed to audiences they aren't in. Saying so stops it reading
                as a notice they were sent and somehow missed. */}
            {canManage && !reachesMe && (
              <span className="text-[11px] text-n-400 italic">not shown to you</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
