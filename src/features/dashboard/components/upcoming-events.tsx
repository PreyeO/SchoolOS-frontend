"use client";

import { CalendarDays } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { useUpcomingEvents } from "../hooks/use-upcoming-events";

export function UpcomingEvents() {
  const { data, isPending } = useUpcomingEvents();

  return (
    <div className="rounded-xl border border-n-200 bg-white p-4">
      <p className="mb-3 text-sm font-semibold text-ink">Upcoming events</p>

      {isPending ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      ) : data && data.length > 0 ? (
        <ul className="space-y-2">
          {data.map((event) => (
            <li key={event.id} className="flex items-center gap-3 rounded-lg bg-n-50 px-3 py-2">
              <CalendarDays className="size-4 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="text-sm text-ink truncate">{event.title}</p>
                <p className="text-xs text-n-400">{event.date}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <CalendarDays className="size-6 text-n-300" />
          <p className="text-sm text-n-400">No upcoming events</p>
        </div>
      )}
    </div>
  );
}
