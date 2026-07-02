"use client";

import { Activity } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { useActivityFeed } from "../hooks/use-activity-feed";

export function ActivityFeed() {
  const { data, isPending } = useActivityFeed();

  return (
    <div className="rounded-xl border border-n-200 bg-white p-4">
      <p className="mb-3 text-sm font-semibold text-ink">Recent activity</p>

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
