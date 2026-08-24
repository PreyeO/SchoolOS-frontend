"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { useSchoolColors } from "@/lib/school/use-school-colors";
import type { AttendancePoint } from "../../api/dashboard-charts-api";

export function AttendanceChart({ data }: { data: AttendancePoint[] }) {
  const { primary } = useSchoolColors();

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid stroke="var(--n-100)" vertical={false} />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--n-400)" }} axisLine={false} tickLine={false} />
        {/* Full 0–100. The axis was pinned to [80, 100] back when the series
            was invented data that never dipped — against real registers a bad
            day (a strike, a flood, a half-empty Monday) would have been drawn
            off the bottom of the chart, hiding exactly the days worth seeing. */}
        <YAxis
          tick={{ fontSize: 11, fill: "var(--n-400)" }}
          axisLine={false}
          tickLine={false}
          width={36}
          unit="%"
          domain={[0, 100]}
        />
        <Tooltip
          contentStyle={{ borderRadius: 8, borderColor: "var(--n-200)", fontSize: 12 }}
          labelStyle={{ color: "var(--ink)", fontWeight: 600 }}
          formatter={(value) => [`${value}%`, "Present"]}
        />
        <Line type="monotone" dataKey="rate" stroke={primary} strokeWidth={2} dot={{ r: 3, fill: primary }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
