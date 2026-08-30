import { Check } from "lucide-react";

import { PILOT_COPY } from "@/data/pilot";

// The framing half of the page. Separate from the form so the copy can be
// rewritten without touching validated inputs, and so neither file grows past
// the point where you can see all of it at once.
export function BookDemoIntro() {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.15em] text-primary">
        {PILOT_COPY.eyebrow}
      </p>

      <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
        {PILOT_COPY.heading}
      </h1>

      <p className="mt-4 text-base leading-relaxed text-n-600">{PILOT_COPY.body}</p>

      <ul className="mt-6 space-y-2.5">
        {PILOT_COPY.reassurances.map((line) => (
          <li key={line} className="flex items-start gap-2.5 text-sm text-n-600">
            <span
              aria-hidden="true"
              className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10"
            >
              <Check className="size-2.5 text-primary" />
            </span>
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}
