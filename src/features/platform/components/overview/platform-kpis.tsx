"use client";

import { Building2, GraduationCap, MapPin, UserRound, Users } from "lucide-react";

import { usePlatformHeadcounts } from "../../hooks/use-platform-stats";
import type { PlatformReach } from "../../lib/platform-reach";
import { KpiTile } from "./kpi-tile";

const n = (value: number) => value.toLocaleString();

function plural(count: number, one: string, many: string) {
  return `${n(count)} ${count === 1 ? one : many}`;
}

// The five numbers that answer "how big is SchoolOS right now". Schools,
// students and reach come from the financials payload; teachers and parents
// are separate counts, so they load (and can fail) on their own.
export function PlatformKpis({ schoolCount, reach }: { schoolCount: number; reach: PlatformReach }) {
  const { data: heads, isPending } = usePlatformHeadcounts();
  const { subscribed, trialing, expired } = reach.access;

  const accessHint = [
    subscribed && `${subscribed} subscribed`,
    trialing && `${trialing} on trial`,
    expired && `${expired} expired`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <dl className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
      <KpiTile label="Schools" value={n(schoolCount)} icon={Building2} hint={accessHint || undefined} />
      <KpiTile
        label="Students"
        value={n(reach.students)}
        icon={GraduationCap}
        hint={reach.capacity > 0 ? `of ${n(reach.capacity)} licensed seats` : undefined}
      />
      <KpiTile
        label="Teachers"
        value={heads?.teachers == null ? null : n(heads.teachers)}
        icon={UserRound}
        isLoading={isPending}
        hint={heads?.admins != null ? `plus ${plural(heads.admins, "school admin", "school admins")}` : undefined}
      />
      <KpiTile
        label="Parents"
        value={heads?.parents == null ? null : n(heads.parents)}
        icon={Users}
        isLoading={isPending}
        hint="with active accounts"
      />
      <KpiTile
        label="Reach"
        value={plural(reach.states.length, "state", "states")}
        icon={MapPin}
        hint={plural(reach.cityCount, "city", "cities")}
      />
    </dl>
  );
}
