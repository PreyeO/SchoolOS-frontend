"use client";

import Link from "next/link";
import { Activity, ArrowRight } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { useCanAccess } from "@/lib/auth/use-can-access";
import { useActivityFeed } from "../hooks/use-activity-feed";

export function ActivityFeed() {
  const { data, isPending } = useActivityFeed();
  // The Audit Log needs view_audit_logs, so an admin whose role lacks it gets no
  // link rather than one that lands on "This page isn't available to your
  // account". Asked of the nav registry, the same question the route guard asks.
  const canOpenAuditLog = useCanAccess("/settings/audit-log");

  return (
    <div className="rounded-xl border border-n-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-ink">Recent activity</p>
        {canOpenAuditLog && (
          <Link
            href="/settings/audit-log"
            className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            All activity
            <ArrowRight className="size-3.5" />
          </Link>
        )}
      </div>

      {isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      ) : data && data.length > 0 ? (
        <ul className="space-y-3">
          {data.map((item) => (
            <li key={item.id} className="text-sm">
              <p className="text-ink leading-snug">{item.text}</p>
              <p className="text-xs text-n-400 mt-0.5">{item.timestamp}</p>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <Activity className="size-6 text-n-300" />
          <p className="text-sm text-n-400">No recent activity yet</p>
        </div>
      )}
    </div>
  );
}
