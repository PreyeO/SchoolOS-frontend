import { Users2 } from "lucide-react";

// Every parent screen is scoped to a child, so with none linked there is
// nothing any of them can show. Stated once, here, rather than each screen
// inventing its own empty state — and it names the fix, since a parent can't
// link themselves.
export function NoChildrenNotice() {
  return (
    <div className="rounded-xl border border-n-200 bg-white p-8 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-n-100">
        <Users2 className="size-5 text-n-400" />
      </div>
      <h2 className="mt-4 font-display text-lg font-semibold text-ink">No children linked yet</h2>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-n-500">
        Ask the school office to link your account to your child&rsquo;s record. Once
        they do, their results and fees appear here.
      </p>
    </div>
  );
}
