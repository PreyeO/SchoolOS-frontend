"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

import type { CardOverview } from "../../lib/card-overview";

interface Props {
  overview: CardOverview;
  checked: number | undefined;
  sessionId: string;
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "waiting" }) {
  return (
    <div className={`rounded-xl px-3.5 py-3 ${tone === "waiting" ? "bg-amber/15" : "bg-n-50"}`}>
      <dt className="text-xs text-n-600">{label}</dt>
      <dd className="mt-0.5 font-display text-2xl font-bold tabular-nums text-ink">{value}</dd>
    </div>
  );
}

const n = (x: number) => x.toLocaleString("en-NG");

// The page's answer to "have my parents got their cards?": how many students
// have one, how many are still waiting, and one button to send the rest.
export function ProgressCard({ overview: o, checked, sessionId }: Props) {
  const pct = o.total ? Math.round((o.haveCard / o.total) * 100) : 0;
  const sendHref = `/scratch-cards/issue?scope=school&session=${sessionId}&check=1`;

  return (
    <section aria-labelledby="progress-heading" className="space-y-5 rounded-2xl border border-n-200 bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 id="progress-heading" className="font-display text-4xl font-bold tabular-nums text-ink">
          {n(o.haveCard)} <span className="text-xl font-semibold text-n-500">of {n(o.total)} students</span>
        </h2>
        <p className="text-sm text-n-600">have their result card this session</p>
      </div>

      <div
        role="img"
        aria-label={`${o.haveCard} of ${o.total} students have a card`}
        className="h-3 overflow-hidden rounded-full bg-n-100"
      >
        <div className="h-full rounded-full bg-grass" style={{ width: `${pct}%` }} />
      </div>

      <dl className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        <Stat label="Have a card" value={n(o.haveCard)} />
        <Stat label="Still waiting" value={n(o.waiting)} tone={o.waiting ? "waiting" : undefined} />
        <Stat label="Need a parent's number" value={n(o.needsNumber)} />
        <Stat label="Parents who checked results" value={checked === undefined ? "–" : n(checked)} />
      </dl>

      {o.waiting > 0 ? (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Button asChild size="lg">
            <Link href={sendHref}>Send cards to the {n(o.waiting)} waiting</Link>
          </Button>
          <p className="text-sm text-n-500">You&rsquo;ll see who gets one and what it costs before anything is sent.</p>
        </div>
      ) : (
        <p className="text-sm font-medium text-grass">Every enrolled student has a card for this session.</p>
      )}
    </section>
  );
}
