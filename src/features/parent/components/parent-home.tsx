"use client";

import { Construction, UserRound, Users2 } from "lucide-react";

import { useMe } from "@/features/me/hooks/use-me";
import { useSchoolStore } from "@/stores/school-store";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// What a parent will be able to do, named concretely rather than left as a bare
// "coming soon" — the children below are real, so the wait has a shape.
const UPCOMING = [
  "See attendance and results for each child",
  "Get notified about absences and announcements",
  "View and pay fees online",
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
              <li
                key={child.id}
                className="flex items-center gap-3 rounded-xl border border-n-200 bg-white p-4"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                  <UserRound className="size-5 text-primary" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-ink">
                    {child.student_name}
                  </span>
                  <span className="block truncate font-mono text-[11px] text-n-400">
                    {child.admission_number}
                  </span>
                  <span className="block truncate text-xs text-n-500 capitalize">
                    {child.relationship}
                    {child.is_primary_contact && " · Primary contact"}
                  </span>
                </span>
              </li>
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
