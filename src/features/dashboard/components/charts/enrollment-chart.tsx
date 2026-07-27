"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { useSchoolColors } from "@/lib/school/use-school-colors";
import type { EnrollmentPoint } from "../../api/dashboard-charts-api";

export function EnrollmentChart({ data }: { data: EnrollmentPoint[] }) {
  const { primary } = useSchoolColors();

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="enrollmentFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={primary} stopOpacity={0.25} />
            <stop offset="95%" stopColor={primary} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--n-100)" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--n-400)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "var(--n-400)" }} axisLine={false} tickLine={false} width={32} />
        <Tooltip
          contentStyle={{ borderRadius: 8, borderColor: "var(--n-200)", fontSize: 12 }}
          labelStyle={{ color: "var(--ink)", fontWeight: 600 }}
        />
        <Area type="monotone" dataKey="students" stroke={primary} strokeWidth={2} fill="url(#enrollmentFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
