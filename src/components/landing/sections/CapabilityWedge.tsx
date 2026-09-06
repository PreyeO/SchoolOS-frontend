import { type CapabilityWedge as CapabilityWedgeType } from "@/data/capabilities";
import { CheckIcon } from "lucide-react";

interface Props {
  wedge: CapabilityWedgeType;
  active: boolean;
  onClick: () => void;
}

export function CapabilityWedge({ wedge, active, onClick }: Props) {
  return (
    <button
      type="button"
      role="tab"
      onClick={onClick}
      aria-selected={active}
      className={[
        "w-full text-left rounded-xl border p-6 transition-colors duration-200",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
        active
          ? "border-brand bg-brand/5"
          : "border-n-200 bg-paper hover:border-brand/40",
      ].join(" ")}
    >
      <p className="font-mono text-xs tracking-[0.12em] uppercase text-brand mb-3">
        {wedge.eyebrow}
      </p>
      <h3 className="font-display text-xl font-semibold text-ink leading-snug mb-3">
        {wedge.heading}
      </h3>

      {active && (
        <div className="mt-4 space-y-4">
          <p className="text-n-600 text-sm leading-relaxed">{wedge.body}</p>
          <ul className="space-y-2">
            {wedge.bullets.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm text-ink">
                <CheckIcon
                  className="mt-0.5 h-4 w-4 shrink-0 text-grass"
                  aria-hidden="true"
                />
                {b}
              </li>
            ))}
          </ul>
          <a
            href={wedge.cta.href}
            {...(wedge.cta.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className="inline-block mt-2 text-sm font-medium text-brand underline underline-offset-4 hover:text-brand/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          >
            {wedge.cta.label}
          </a>
        </div>
      )}
    </button>
  );
}
