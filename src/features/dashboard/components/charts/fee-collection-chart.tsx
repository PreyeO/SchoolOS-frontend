"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { FeeCollectionPoint } from "../../api/dashboard-charts-api";

// Mirrors --brand / --amber in globals.css.
const BRAND = "#1E5B4F";
const AMBER = "#F2A93B";

export function FeeCollectionChart({ data }: { data: FeeCollectionPoint[] }) {
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
        <Bar dataKey="collected" name="Collected" fill={BRAND} radius={[4, 4, 0, 0]} />
        <Bar dataKey="outstanding" name="Outstanding" fill={AMBER} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
