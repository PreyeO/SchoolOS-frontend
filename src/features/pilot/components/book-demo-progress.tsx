import { PILOT_COPY } from "@/data/pilot";

// Tells the visitor how much is left. A three-step form without this reads as
// open-ended, which is the thing splitting it up was meant to fix.
export function BookDemoProgress({ index }: { index: number }) {
  const steps = PILOT_COPY.steps;
  const step = steps[index];

  return (
    <div className="mb-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-base font-semibold text-ink">{step.title}</h2>
        <span className="shrink-0 text-xs text-n-400">
          Step {index + 1} of {steps.length}
        </span>
      </div>
      <p className="mt-0.5 text-sm text-n-500">{step.blurb}</p>

      <div className="mt-3 flex gap-1.5" role="presentation">
        {steps.map((s, i) => (
          <span
            key={s.id}
            className={`h-1 flex-1 rounded-full transition-colors ${
              i <= index ? "bg-primary" : "bg-n-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
