import { CAPABILITY_GRID } from "@/data/capabilities";

// Previously headed "Also included", which read as a list of working features.
// None of them are built, so every item now carries its own Soon badge and the
// heading says so too. A visible roadmap still sells; six false claims don't.
export function CapabilityGrid() {
  return (
    <div className="border-t border-n-200 pt-8 mt-8">
      <p className="font-mono text-xs tracking-[0.15em] uppercase text-n-400 mb-6">
        On the roadmap
      </p>
      <ul className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
        {CAPABILITY_GRID.map((item) => (
          <li key={item.label}>
            <p className="flex flex-wrap items-center gap-x-2 text-sm font-medium text-ink">
              {item.label}
              <span className="rounded-full border border-n-200 bg-n-50 px-1.5 py-px text-[10px] font-normal tracking-wide text-n-500">
                Soon
              </span>
            </p>
            <p className="text-xs text-n-500 mt-0.5 leading-relaxed">{item.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
