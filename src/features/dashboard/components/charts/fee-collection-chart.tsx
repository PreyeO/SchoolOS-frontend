"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { useSchoolColors } from "@/lib/school/use-school-colors";
import { formatNaira } from "@/lib/text/format-naira";
import type { FeeCollectionPoint } from "../../api/dashboard-charts-api";

// Compact axis labels — a term's collection runs to seven or eight figures, and
// "₦12,400,000" on every gridline crowds a 200px card off its own axis.
function compactNaira(value: number): string {
  if (value >= 1_000_000) return `₦${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `₦${Math.round(value / 1_000)}k`;
  return `₦${value}`;
}

export function FeeCollectionChart({ data }: { data: FeeCollectionPoint[] }) {
  const { primary, accent } = useSchoolColors();

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid stroke="var(--n-100)" vertical={false} />
        <XAxis dataKey="term" tick={{ fontSize: 11, fill: "var(--n-400)" }} axisLine={false} tickLine={false} />
        {/* These are Naira amounts, not percentages. The axis carried unit="%"
            from when the series was hardcoded fake percentages — against the
            real endpoint that labelled millions of Naira as "12400000%". */}
        <YAxis
          tick={{ fontSize: 11, fill: "var(--n-400)" }}
          axisLine={false}
          tickLine={false}
          width={52}
          tickFormatter={compactNaira}
        />
        <Tooltip
          contentStyle={{ borderRadius: 8, borderColor: "var(--n-200)", fontSize: 12 }}
          labelStyle={{ color: "var(--ink)", fontWeight: 600 }}
          formatter={(value) => formatNaira(Number(value))}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="collected" name="Collected" fill={primary} radius={[4, 4, 0, 0]} />
        <Bar dataKey="outstanding" name="Outstanding" fill={accent} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
