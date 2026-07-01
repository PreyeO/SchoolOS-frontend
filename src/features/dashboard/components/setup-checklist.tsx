"use client";

import { CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";

import { useSetupStatus } from "@/features/onboarding/hooks/use-setup-status";
import { cn } from "@/lib/utils";

const CHECKLIST_ITEMS = [
  { label: "Set up school branding", key: "branding" as const, href: "#" },
  { label: "Create academic year", key: "academic_year" as const, href: "#" },
  { label: "Add your classes", key: "classes" as const, href: "/students" },
  { label: "Choose subjects", key: "subjects" as const, href: "#" },
];

export function SetupChecklist() {
  const { setupStatus, isComplete, completedCount, totalSteps } = useSetupStatus();

  if (isComplete) return null;

  const pct = Math.round((completedCount / totalSteps) * 100);

  return (
    <div className="rounded-xl border border-n-200 bg-white p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-sm text-ink">Finish setting up your school</p>
          <p className="text-xs text-n-500 mt-0.5">{completedCount} of {totalSteps} steps done</p>
        </div>
        <div className="relative size-10">
          <svg viewBox="0 0 36 36" className="size-10 -rotate-90">
            <circle cx="18" cy="18" r="14" fill="none" stroke="var(--n-100)" strokeWidth="4" />
            <circle
              cx="18" cy="18" r="14" fill="none"
              stroke="#1E5B4F" strokeWidth="4"
              strokeDasharray={`${pct * 0.879} 87.9`}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-ink">
            {pct}%
          </span>
        </div>
      </div>

      <ul className="space-y-2">
        {CHECKLIST_ITEMS.map((item) => {
          const done = setupStatus[item.key];
          return (
            <li key={item.key} className="flex items-center gap-2.5">
              {done
                ? <CheckCircle2 className="size-4 shrink-0 text-grass" />
                : <Circle className="size-4 shrink-0 text-n-300" />}
              <Link
                href={item.href}
                className={cn(
                  "text-sm",
                  done ? "text-n-400 line-through" : "text-ink hover:text-brand transition-colors",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
