"use client";

import Link from "next/link";
import { ArrowRight, Megaphone } from "lucide-react";

import { useAnnouncements } from "../hooks/use-announcements";
import { NoticeDigestItem } from "./notice-digest-item";

const PREVIEW_COUNT = 3;

// The school's latest notices, as a digest rather than the full board — used on
// the parent and student home screens.
//
// The list arrives already filtered to the reader's audience (the backend
// scopes it by audience_personas overlap), so everything here is addressed to
// them and none of the board's manager affordances apply. That's also why this
// is safe on any persona's home: it can never surface a notice they shouldn't
// see, whatever screen embeds it.
//
// The admin overview has its own card (dashboard/RecentAnnouncements) — same
// rows, but it has to say something when there are none, where this hides.
export function RecentNotices() {
  const { data, isPending, isError } = useAnnouncements();
  const notices = (data ?? []).slice(0, PREVIEW_COUNT);

  // A failed or empty notice board isn't worth a card on a parent's home — the
  // screen is about their children, and an error here would draw the eye away
  // from the part that loaded fine.
  if (isPending || isError || notices.length === 0) return null;

  return (
    <section className="rounded-xl border border-n-200 bg-white">
      <div className="flex items-center justify-between gap-3 border-b border-n-100 px-4 py-3">
        <h2 className="flex items-center gap-2 font-display text-base font-semibold text-ink">
          <Megaphone className="size-4 text-n-400" />
          From the school
        </h2>
        <Link
          href="/announcements"
          className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          All notices
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <ul className="divide-y divide-n-100">
        {notices.map((notice) => (
          <NoticeDigestItem key={notice.id} notice={notice} />
        ))}
      </ul>
    </section>
  );
}
