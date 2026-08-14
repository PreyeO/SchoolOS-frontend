"use client";

import { Construction, School, UserRound } from "lucide-react";

import { useMe } from "@/features/me/hooks/use-me";
import { useSchoolStore } from "@/stores/school-store";
import { armDisplayName } from "@/lib/school/arm-display-name";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const UPCOMING = [
  "Check your timetable and assignments",
  "See your results and attendance record",
  "Access learning materials shared by your teachers",
];

export function StudentHome() {
  const { data: me, isPending } = useMe();
  const school = useSchoolStore((s) => s.currentSchool);
  const currentClass = me?.student?.current_class ?? null;
  const guardians = me?.student?.parent_links ?? [];

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-2">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">
          {greeting()}
          {me?.user.first_name ? `, ${me.user.first_name}` : ""}
        </h1>
        <p className="mt-1 text-sm text-n-500">{school?.name ?? me?.school.name}</p>
      </div>

      <div className="flex items-center gap-4 rounded-xl border border-n-200 bg-white p-5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <School className="size-5 text-primary" />
        </span>
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-n-400">Your class</p>
          {isPending ? (
            <p className="mt-1 text-sm text-n-400" role="status">Loading…</p>
          ) : currentClass ? (
            <p className="mt-0.5 text-lg font-semibold text-ink">
              {armDisplayName(currentClass.arm_name, currentClass.class_name)}
              <span className="ml-2 text-sm font-normal text-n-400">{currentClass.session}</span>
            </p>
          ) : (
            // Not a cosmetic empty state: with no enrolment they're on no
            // register, so nothing downstream will have anything to show either.
            <p className="mt-0.5 text-sm text-n-500">
              You haven&rsquo;t been placed in a class for this term yet. Ask the school
              office.
            </p>
          )}
        </div>
      </div>

      {guardians.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-base font-semibold text-ink">
            {guardians.length === 1 ? "Your guardian" : "Your guardians"}
          </h2>
          <ul className="grid gap-3 sm:grid-cols-2">
            {guardians.map((guardian) => (
              <li
                key={guardian.id}
                className="flex items-center gap-3 rounded-xl border border-n-200 bg-white p-4"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-n-100">
                  <UserRound className="size-5 text-n-400" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-ink">
                    {guardian.parent_name}
                  </span>
                  <span className="block truncate text-xs text-n-500 capitalize">
                    {guardian.relationship}
                    {guardian.is_primary_contact && " · Primary contact"}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

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
