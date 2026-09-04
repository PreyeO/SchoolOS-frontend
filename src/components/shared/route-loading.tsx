import { Loader2 } from "lucide-react";

// The fallback every route segment's loading.tsx renders. Next wraps page.tsx
// in an implicit <Suspense> keyed off this file, so it appears the instant a
// navigation starts — not after the new page's server render finishes — which
// is the whole point: no loading.tsx anywhere in this app meant a click on a
// searchParams-driven page (attendance, fees, my-classes...) left the OLD
// screen sitting there with no feedback at all until the new one was fully
// ready, so any nonzero delay read as the click having done nothing.
//
// loading.tsx can't take props ("Loading UI components do not accept any
// parameters" — Next's own docs), so this stays generic rather than naming
// the resource the way the in-page "Loading fees…" text elsewhere does.
export function RouteLoading() {
  return (
    <div className="flex items-center justify-center py-16" role="status" aria-label="Loading">
      <Loader2 className="size-5 animate-spin text-n-300" />
    </div>
  );
}
