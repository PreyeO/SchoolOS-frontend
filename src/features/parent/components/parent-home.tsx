"use client";

import { Construction, Users2 } from "lucide-react";

import { useMe } from "@/features/me/hooks/use-me";
import { useSchoolStore } from "@/stores/school-store";

import { ChildCard } from "./child-card";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// What's still genuinely unbuilt. Results and fees came off this list when they
// landed on the child detail page; announcements came off when the notice board
// opened to parents. Each remaining line needs backend that doesn't exist yet —
// attendance has no parent-visible endpoint (attendance/views.py returns an
// empty queryset for any non-staff caller), online payment has no gateway
// integration at all, and there's no messaging app. Don't re-add a line here
// without checking the backend actually supports it.
const UPCOMING = [
  "Get notified when your child is marked absent",
  "Pay fees online",
  "Message your child's teachers",
];

export function ParentHome() {
  const { data: me, isPending } = useMe();
  const school = useSchoolStore((s) => s.currentSchool);
  const children = me?.parent?.student_links ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-2">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">
          {greeting()}
          {me?.user.first_name ? `, ${me.user.first_name}` : ""}
        </h1>
        <p className="mt-1 text-sm text-n-500">
          {school?.name ?? me?.school.name}
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="font-display text-base font-semibold text-ink">
          {children.length === 1 ? "Your child" : "Your children"}
        </h2>

        {isPending ? (
          <p className="text-sm text-n-400" role="status">Loading…</p>
        ) : children.length === 0 ? (
          <div className="rounded-xl border border-n-200 bg-white p-6 text-center">
            <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-n-100">
              <Users2 className="size-5 text-n-400" />
            </div>
            <p className="mt-3 text-sm font-medium text-ink">No children linked yet</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-n-500">
              Ask the school office to link your account to your child&rsquo;s record.
            </p>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {children.map((child) => (
              <ChildCard key={child.id} child={child} />
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-n-200 bg-white p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-n-400">
          What&rsquo;s coming
        </p>
        <ul className="mt-3 space-y-2">
          {UPCOMING.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-ink">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
              {item}
            </li>
          ))}
        </ul>
        <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-amber/30 bg-amber/10 px-3 py-1 text-xs font-medium text-ink">
          <Construction className="size-3.5 text-amber" />
          In development
        </span>
      </section>
    </div>
  );
}
