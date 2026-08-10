"use client";

import { Construction, type LucideIcon } from "lucide-react";

import { useSchoolStore } from "@/stores/school-store";

interface Props {
  title: string;
  description: string;
  icon: LucideIcon;
  // What this persona will be able to do, so the wait has a shape.
  upcoming: string[];
}

// Home screen for a persona whose experience hasn't been built yet. Deliberately
// concrete about what's coming rather than a bare "coming soon" — someone who
// logs in and finds nothing should at least learn what the app will do for them.
export function PersonaPlaceholder({ title, description, icon: Icon, upcoming }: Props) {
  const school = useSchoolStore((s) => s.currentSchool);

  return (
    <div className="mx-auto max-w-lg py-10">
      <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10">
        <Icon className="size-5 text-primary" />
      </div>

      <h1 className="mt-5 font-display text-2xl font-bold text-ink">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-n-500">
        {description}
        {school?.name && (
          <>
            {" "}
            You&rsquo;re signed in at <span className="text-ink">{school.name}</span>.
          </>
        )}
      </p>

      <div className="mt-6 rounded-xl border border-n-200 bg-white p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-n-400">
          What&rsquo;s coming
        </p>
        <ul className="mt-3 space-y-2">
          {upcoming.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm text-ink">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <span className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-amber/30 bg-amber/10 px-3 py-1 text-xs font-medium text-ink">
        <Construction className="size-3.5 text-amber" />
        In development
      </span>
    </div>
  );
}
