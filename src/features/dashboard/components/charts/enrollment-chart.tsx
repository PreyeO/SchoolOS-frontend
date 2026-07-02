"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { EnrollmentPoint } from "../../api/dashboard-charts-api";

// Mirrors --brand in globals.css — recharts needs a concrete color, not a CSS var.
const BRAND = "#1E5B4F";

export function EnrollmentChart({ data }: { data: EnrollmentPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="enrollmentFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={BRAND} stopOpacity={0.25} />
            <stop offset="95%" stopColor={BRAND} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--n-100)" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--n-400)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "var(--n-400)" }} axisLine={false} tickLine={false} width={32} />
        <Tooltip
          contentStyle={{ borderRadius: 8, borderColor: "var(--n-200)", fontSize: 12 }}
          labelStyle={{ color: "var(--ink)", fontWeight: 600 }}
        />
        <Area type="monotone" dataKey="students" stroke={BRAND} strokeWidth={2} fill="url(#enrollmentFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
