import { Layers } from "lucide-react";

import type { PlatformReach } from "../../lib/platform-reach";
import { OverviewCard } from "./overview-card";

// Status colours match AccessBadge, so the bar and the badges elsewhere on
// the page read as one system.
const ACCESS = [
  { key: "subscribed", label: "Subscribed", bar: "bg-grass" },
  { key: "trialing", label: "On trial", bar: "bg-amber" },
  { key: "expired", label: "Expired", bar: "bg-clay" },
] as const;

// Who the platform is made of: how many schools pay, and which levels of
// school SchoolOS is actually serving (one school can run several levels).
export function PlatformMix({ reach, schoolCount }: { reach: PlatformReach; schoolCount: number }) {
  const total = Math.max(schoolCount, 1);

  return (
    <OverviewCard title="Platform mix" icon={Layers}>
      <div className="space-y-5 px-4 py-4">
        <div className="space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-n-400">Access</p>
          <div className="flex h-2 overflow-hidden rounded-full bg-n-100" aria-hidden="true">
            {ACCESS.map((a) => (
              <div key={a.key} className={a.bar} style={{ width: `${(reach.access[a.key] / total) * 100}%` }} />
            ))}
          </div>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-n-500">
            {ACCESS.map((a) => (
              <li key={a.key} className="flex items-center gap-1.5">
                <span className={`size-2 rounded-full ${a.bar}`} aria-hidden="true" />
                {a.label} <span className="tabular-nums font-medium text-ink">{reach.access[a.key]}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-n-400">Levels served</p>
          <ul className="space-y-1.5">
            {reach.levels.map((l) => (
              <li key={l.value} className="flex items-center gap-3 text-sm">
                <span className={`min-w-0 flex-1 truncate ${l.schools ? "text-ink" : "text-n-400"}`}>{l.label}</span>
                <span className="w-24 shrink-0 rounded-full bg-n-100" aria-hidden="true">
                  <span className="block h-1.5 rounded-full bg-primary" style={{ width: `${(l.schools / total) * 100}%` }} />
                </span>
                <span className="w-16 shrink-0 text-right text-xs tabular-nums text-n-500">
                  {l.schools} {l.schools === 1 ? "school" : "schools"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </OverviewCard>
  );
}
