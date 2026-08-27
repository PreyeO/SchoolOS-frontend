"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { StudentSubjectResult } from "@/features/results/types";
import { useSchoolColors } from "@/lib/school/use-school-colors";
import { ordinal } from "@/lib/text/ordinal";

interface Row {
  subject: string;
  score: number;
  grade: string | null;
  position: number | null;
}

interface TooltipPayload {
  active?: boolean;
  payload?: { payload: Row }[];
}

function ScoreTooltip({ active, payload }: TooltipPayload) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-lg border border-n-200 bg-white px-2.5 py-1.5 text-xs shadow-sm">
      <p className="font-medium text-ink">{row.subject}</p>
      <p className="mt-0.5 text-n-500">
        {row.score}
        {row.grade && <> · {row.grade}</>}
        {row.position !== null && <> · {ordinal(row.position)}</>}
      </p>
    </div>
  );
}

// Where a child is strong and where they're struggling, at a glance — the
// question the report card's own table answers only by reading every row.
//
// Horizontal bars because subject names are words, not dates: vertical bars
// would either truncate them or turn the axis diagonal. Sorted high to low so
// the shape of the term is the first thing read, rather than alphabetical order
// which carries no meaning.
export function SubjectScoresChart({ subjects }: { subjects: StudentSubjectResult[] }) {
  const { primary, accent } = useSchoolColors();

  const rows: Row[] = subjects
    .map((s) => ({
      subject: s.subject_name,
      score: Number(s.total_score),
      grade: s.grade,
      position: s.subject_position_in_arm,
    }))
    .sort((a, b) => b.score - a.score);

  return (
    <ResponsiveContainer width="100%" height={Math.max(160, rows.length * 32)}>
      <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 4 }}>
        <CartesianGrid stroke="var(--n-100)" horizontal={false} />
        <XAxis
          type="number"
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: "var(--n-400)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="subject"
          tick={{ fontSize: 11, fill: "var(--n-500)" }}
          axisLine={false}
          tickLine={false}
          width={110}
        />
        <Tooltip content={<ScoreTooltip />} cursor={{ fill: "var(--n-100)" }} />
        <Bar dataKey="score" radius={[0, 4, 4, 0]} maxBarSize={18}>
          {/* Accent marks anything under 40 — a fail on every Nigerian scale
              this app ships defaults for. One colour for "needs attention"
              rather than a per-grade palette, which would turn a report card
              into a rainbow and stop any single bar standing out. */}
          {rows.map((row) => (
            <Cell key={row.subject} fill={row.score < 40 ? accent : primary} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
