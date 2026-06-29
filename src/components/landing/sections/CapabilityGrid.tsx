import { CAPABILITY_GRID } from "@/data/capabilities";

export function CapabilityGrid() {
  return (
    <div className="border-t border-n-200 pt-8 mt-8">
      <p className="font-mono text-xs tracking-[0.15em] uppercase text-n-400 mb-6">
        Also included
      </p>
      <ul className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
        {CAPABILITY_GRID.map((item) => (
          <li key={item.label}>
            <p className="font-medium text-ink text-sm">{item.label}</p>
            <p className="text-xs text-n-500 mt-0.5 leading-relaxed">{item.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
