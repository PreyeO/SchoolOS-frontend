import { School } from "lucide-react";

// A student with no enrolment for the current session has no class, and so no
// results, fees or subjects either — every one of those is keyed off the class
// they're in. Said once, plainly, rather than repeated as four empty cards.
export function NotEnrolledNotice() {
  return (
    <div className="rounded-xl border border-n-200 bg-white p-8 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-n-100">
        <School className="size-5 text-n-400" />
      </div>
      <h2 className="mt-4 font-display text-lg font-semibold text-ink">
        You&rsquo;re not in a class yet
      </h2>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-n-500">
        Your results, fees and subjects appear here once the school places you in a
        class for this term. Ask the school office if you think this is wrong.
      </p>
    </div>
  );
}
