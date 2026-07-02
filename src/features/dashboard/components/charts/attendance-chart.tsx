"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { AttendancePoint } from "../../api/dashboard-charts-api";

// Mirrors --grass in globals.css.
const GRASS = "#3FA66A";

export function AttendanceChart({ data }: { data: AttendancePoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid stroke="var(--n-100)" vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--n-400)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "var(--n-400)" }} axisLine={false} tickLine={false} width={32} unit="%" domain={[80, 100]} />
        <Tooltip
          contentStyle={{ borderRadius: 8, borderColor: "var(--n-200)", fontSize: 12 }}
          labelStyle={{ color: "var(--ink)", fontWeight: 600 }}
        />
        <Line type="monotone" dataKey="rate" stroke={GRASS} strokeWidth={2} dot={{ r: 3, fill: GRASS }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
