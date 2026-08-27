"use client";

import Link from "next/link";
import { ArrowRight, Megaphone } from "lucide-react";

import { formatRelativeTime } from "@/lib/text/format-relative-time";

import { useAnnouncements } from "../hooks/use-announcements";
import { categoryMeta } from "../lib/categories";

const PREVIEW_COUNT = 3;

// Strips tags for a one-line preview. body_html is already bleach-sanitized
// server-side to a fixed allowlist, so this is about flattening structure for a
// single line, not about safety — and the result goes into a text node, never
// back into dangerouslySetInnerHTML.
function plainText(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

// The school's latest notices, as a digest rather than the full board — used on
// the parent and student home screens.
//
// The list arrives already filtered to the reader's audience (the backend
// scopes it by audience_personas overlap), so everything here is addressed to
// them and none of the board's manager affordances apply. That's also why this
// is safe on any persona's home: it can never surface a notice they shouldn't
// see, whatever screen embeds it.
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
        {notices.map((notice) => {
          const kind = categoryMeta(notice.category);
          const KindIcon = kind.icon;
          const body = plainText(notice.body_html);

          return (
            <li key={notice.id}>
              <Link
                href="/announcements"
                className="block px-4 py-3 transition-colors hover:bg-n-50"
              >
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                    {notice.title}
                  </p>
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
                <p className="mt-1 text-[11px] text-n-400">
                  {formatRelativeTime(notice.created_at)}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
