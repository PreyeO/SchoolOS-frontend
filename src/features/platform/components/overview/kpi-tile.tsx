import type { LucideIcon } from "lucide-react";

interface Props {
  label: string;
  // null = couldn't be read (no permission, or failed). Shown as "—" with
  // the reason, never as 0 — "no access" and "nobody" are different facts.
  value: string | null;
  icon: LucideIcon;
  hint?: string;
  isLoading?: boolean;
}

export function KpiTile({ label, value, icon: Icon, hint, isLoading = false }: Props) {
  return (
    <div className="min-w-0 rounded-xl border border-n-200 bg-white p-4">
      <dt className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-n-400">
        <Icon className="size-3.5 shrink-0" />
        {label}
      </dt>
      <dd className="mt-1.5 font-display text-2xl font-bold tabular-nums text-ink">
        {isLoading ? <span className="inline-block h-7 w-12 animate-pulse rounded bg-n-100" /> : (value ?? "—")}
      </dd>
      {!isLoading && (value === null || hint) && (
        <dd className="mt-0.5 text-[11px] text-n-500">{value === null ? "Not visible to your role" : hint}</dd>
      )}
    </div>
  );
}
