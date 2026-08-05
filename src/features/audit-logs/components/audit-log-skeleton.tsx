import { Skeleton } from "@/components/ui/skeleton";

// Mirrors the real timeline's shape (day header + icon rail + two text lines)
// so the layout doesn't jump when entries land.
export function AuditLogSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Loading activity">
      {Array.from({ length: 2 }).map((_, group) => (
        <div key={group}>
          <Skeleton className="mb-1.5 h-3 w-20" />
          <div className="divide-y divide-n-100 rounded-xl border border-n-200 bg-white">
            {Array.from({ length: 4 }).map((_, row) => (
              <div key={row} className="flex items-start gap-3 px-4 py-3">
                <Skeleton className="size-7 shrink-0 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-2/3" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
                <Skeleton className="h-3 w-12 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
