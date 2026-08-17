"use client";

import Link from "next/link";
import { BookOpen, ClipboardCheck, School } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/error-state";
import { OfflineNotice } from "@/components/shared/offline-notice";

import { useMyClasses } from "../hooks/use-my-classes";

export function MyClassesPage() {
  const { classes, isPending, unavailableOffline, isError, error } = useMyClasses();

  if (unavailableOffline) {
    return <OfflineNotice resourceLabel="Your classes" />;
  }

  if (isPending) {
    return <p className="text-sm text-n-400" role="status">Loading your classes…</p>;
  }

  if (isError) {
    return <ErrorState error={error} resourceLabel="your classes" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-ink">My Classes</h1>
        <p className="mt-1 text-sm text-n-500">
          Every class you&rsquo;re assigned to — as its form teacher, or for a subject you
          teach in it.
        </p>
      </div>

      {classes.length === 0 ? (
        <div className="rounded-xl border border-n-200 bg-white p-8 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-n-100">
            <School className="size-5 text-n-400" />
          </div>
          <h2 className="mt-4 font-display text-lg font-semibold text-ink">No classes yet</h2>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-n-500">
            You&rsquo;ll see a class here once an administrator makes you its class
            teacher or assigns you a subject in it.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((klass) => (
            <div key={klass.classArmId} className="flex flex-col rounded-xl border border-n-200 bg-white p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="truncate font-display text-base font-semibold text-ink">{klass.label}</h2>
                  {klass.label !== klass.className && (
                    <p className="truncate text-xs text-n-400">{klass.className}</p>
                  )}
                </div>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <School className="size-4 text-primary" />
                </span>
              </div>

              {klass.isFormClass && (
                <span className="mt-2 self-start rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                  Form class
                </span>
              )}

              <div className="mt-3 flex-1">
                <p className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-n-400">
                  <BookOpen className="size-3" />
                  {klass.subjects.length} subject{klass.subjects.length === 1 ? "" : "s"}
                </p>
                {klass.subjects.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {klass.subjects.map((subject) => (
                      <span
                        key={subject}
                        className="rounded-full border border-n-200 px-2.5 py-0.5 text-xs text-ink"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-n-400 italic">
                    You&rsquo;re the form teacher here, but aren&rsquo;t assigned to teach a
                    subject in it.
                  </p>
                )}
              </div>

              <Button type="button" variant="outline" size="sm" asChild className="mt-4 w-full">
                <Link href={`/attendance?arm=${klass.classArmId}`}>
                  <ClipboardCheck className="size-3.5 mr-1.5" />
                  Take register
                </Link>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
