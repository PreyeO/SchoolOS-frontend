"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { useSchoolColors } from "@/lib/school/use-school-colors";
import type { FeeCollectionPoint } from "../../api/dashboard-charts-api";

export function FeeCollectionChart({ data }: { data: FeeCollectionPoint[] }) {
  const { primary, accent } = useSchoolColors();

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid stroke="var(--n-100)" vertical={false} />
        <XAxis dataKey="term" tick={{ fontSize: 11, fill: "var(--n-400)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "var(--n-400)" }} axisLine={false} tickLine={false} width={32} unit="%" />
        <Tooltip
          contentStyle={{ borderRadius: 8, borderColor: "var(--n-200)", fontSize: 12 }}
          labelStyle={{ color: "var(--ink)", fontWeight: 600 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="collected" name="Collected" fill={primary} radius={[4, 4, 0, 0]} />
        <Bar dataKey="outstanding" name="Outstanding" fill={accent} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
