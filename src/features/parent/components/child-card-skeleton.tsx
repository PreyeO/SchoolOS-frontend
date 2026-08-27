import { Skeleton } from "@/components/ui/skeleton";

// Mirrors ChildCard's shape — avatar, two title lines, then the two stats under
// a divider — so the grid doesn't jump when the ledger and report card land.
export function ChildCardSkeleton() {
  return (
    <li
      className="rounded-xl border border-n-200 bg-white p-4"
      role="status"
      aria-label="Loading child"
    >
      <div className="flex items-start gap-3">
        <Skeleton className="size-11 shrink-0 rounded-full" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <div className="mt-3.5 grid grid-cols-2 gap-2 border-t border-n-100 pt-3">
        {[0, 1].map((i) => (
          <div key={i} className="space-y-1.5">
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="h-5 w-14" />
            <Skeleton className="h-2.5 w-20" />
          </div>
        ))}
      </div>
    </li>
  );
}
