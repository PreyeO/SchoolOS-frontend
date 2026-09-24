"use client";

import Link from "next/link";
import { ArrowRight, Megaphone } from "lucide-react";

import { ErrorState } from "@/components/shared/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { NoticeDigestItem } from "@/features/communication/components/notice-digest-item";
import { useAnnouncements } from "@/features/communication/hooks/use-announcements";
import { useHasSchoolPermission } from "@/lib/auth/use-school-permission";

// Three, not five: a notice row is three lines (title, preview, age) against
// Recent activity's two, so three of these is about the height of that card's
// five entries and the pair sits level in the grid. More is one click away.
const COUNT = 3;

// The admin overview's stand-in for the Upcoming events card, which had no
// backend behind it — there is no calendar module. Notices are the nearest real
// thing: the `event` category already lets a school announce a PTA meeting or a
// sports day, and those show here with their badge like anything else posted.
//
// Same query as the Announcements board, so this costs no extra request there
// and the board opens already warm.
//
// A holder of post_notices gets every notice in the school, including ones aimed
// at audiences they aren't in — which is what an admin wants from a digest of
// what has gone out. Anyone else gets only what was addressed to them, the same
// server-side scoping as everywhere else.
export function RecentAnnouncements() {
  const { data, isPending, isError, error } = useAnnouncements();
  const canPost = useHasSchoolPermission("post_notices");
  const notices = (data ?? []).slice(0, COUNT);

  return (
    <div className="rounded-xl border border-n-200 bg-white">
      <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-1">
        <p className="text-sm font-semibold text-ink">Recent announcements</p>
        <Link
          href="/announcements"
          className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          All announcements
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {isPending ? (
        <div className="space-y-3 px-4 pt-2 pb-4">
          {Array.from({ length: COUNT }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : isError ? (
        <div className="px-4 pt-2 pb-4">
          <ErrorState error={error} resourceLabel="announcements" />
        </div>
      ) : notices.length > 0 ? (
        <ul className="divide-y divide-n-100">
          {notices.map((notice) => (
            <NoticeDigestItem key={notice.id} notice={notice} />
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
          <Megaphone className="size-6 text-n-300" />
          <p className="text-sm text-n-400">No announcements yet</p>
          {canPost && (
            <Link href="/announcements" className="text-xs font-medium text-primary hover:underline">
              Post one
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
