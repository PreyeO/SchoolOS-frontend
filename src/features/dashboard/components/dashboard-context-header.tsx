"use client";

import Link from "next/link";
import { Sparkles, TriangleAlert } from "lucide-react";

import { useMe } from "@/features/me/hooks/use-me";
import { greeting } from "@/lib/text/greeting";
import { useAccessStatus } from "../hooks/use-access-status";

export function DashboardContextHeader() {
  // Already in cache — useSchoolPermissions reaches /me from the shell's nav
  // gating on every school screen — so this costs no extra request.
  const { data: me } = useMe();
  const firstName = me?.user.first_name;
  const access = useAccessStatus();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        {/* Greets the person, not the school — "Good morning, Grace" rather
            than "Good morning, Grace Academy", which read as addressing the
            building. No context is lost: the school name is still on screen
            twice, in the sidebar header and in the topbar's SchoolSwitcher
            (which is the one that survives a collapsed sidebar).
            Falls back to the bare greeting rather than showing a comma with
            nothing after it while /me is still in flight. */}
        <h1 className="font-display text-2xl font-bold text-ink">
          {firstName ? `${greeting()}, ${firstName}` : greeting()} 👋
        </h1>
      </div>

      {access?.isTrialing && (
        <Link
          href="/settings/subscription"
          className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-primary/20"
        >
          <Sparkles className="size-3.5 text-primary" />
          {access.daysLeft === null
            ? "On trial"
            : access.daysLeft === 0
              ? "Trial ends today"
              : `Trial: ${access.daysLeft} day${access.daysLeft === 1 ? "" : "s"} left`}
          <span className="text-primary underline underline-offset-2">Upgrade</span>
        </Link>
      )}

      {/* An expired school can't write anything — registers, scores and
          payments all refuse. Saying so here, where it's unmissable, beats
          letting them discover it one failed save at a time. */}
      {access?.isExpired && (
        <Link
          href="/settings/subscription"
          className="flex items-center gap-2 rounded-full border border-clay/40 bg-clay/10 px-3.5 py-1.5 text-xs font-medium text-ink transition-colors hover:bg-clay/20"
        >
          <TriangleAlert className="size-3.5 text-clay" />
          Access expired
          <span className="text-clay underline underline-offset-2">Renew</span>
        </Link>
      )}
    </div>
  );
}
