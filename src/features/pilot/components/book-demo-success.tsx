import { MessageCircle } from "lucide-react";

import { PILOT_COPY } from "@/data/pilot";

// Replaces the form rather than sitting above it: the visitor is done, and
// leaving a filled-in form on screen invites a second submission.
//
// Repeats the channel and the timeframe from the intro, because this is the
// moment the promise has to be remembered rather than the moment it was made.
export function BookDemoSuccess({ firstName }: { firstName: string }) {
  return (
    <div className="rounded-2xl border border-n-200 bg-white p-6 text-center sm:p-8">
      <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10">
        <MessageCircle className="size-6 text-primary" />
      </span>

      <h2 className="mt-4 font-display text-xl font-semibold text-ink">
        {PILOT_COPY.successHeading(firstName)}
      </h2>

      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-n-600">
        {PILOT_COPY.successBody}
      </p>
    </div>
  );
}
