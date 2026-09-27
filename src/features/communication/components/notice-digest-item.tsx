import Link from "next/link";

import { formatRelativeTime } from "@/lib/text/format-relative-time";

import { categoryMeta } from "../lib/categories";
import { plainText } from "../lib/plain-text";
import type { Announcement } from "../types";

// One notice as a row in a digest: title, kind badge, a one-line preview and how
// long ago it went out. Links to the full board rather than to the notice
// itself — the board has no per-notice route, so every row lands in the same
// place.
//
// Shared by the parent/student home (RecentNotices) and the admin overview
// (RecentAnnouncements), so the two can't drift apart. Renders a bare <li> with
// its own horizontal padding, so it belongs in a card with no padding of its own.
export function NoticeDigestItem({ notice }: { notice: Announcement }) {
  const kind = categoryMeta(notice.category);
  const KindIcon = kind.icon;
  const body = plainText(notice.body_html);

  return (
    <li>
      <Link href="/announcements" className="block px-4 py-3 transition-colors hover:bg-n-50">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{notice.title}</p>
          {KindIcon && (
            <span
              className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${kind.badge}`}
            >
              <KindIcon className="size-3" />
              {kind.label}
            </span>
          )}
        </div>
        {body && <p className="mt-0.5 truncate text-xs text-n-500">{body}</p>}
        <p className="mt-1 text-[11px] text-n-400">{formatRelativeTime(notice.created_at)}</p>
      </Link>
    </li>
  );
}
