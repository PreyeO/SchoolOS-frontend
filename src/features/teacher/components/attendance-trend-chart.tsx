"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { useSchoolColors } from "@/lib/school/use-school-colors";
import type { TrendPoint } from "../hooks/use-teacher-overview";

interface TooltipPayload {
  active?: boolean;
  payload?: { payload: TrendPoint }[];
}

// Values must be reachable without hovering, so the tooltip enhances rather than
// gates — the endpoint is direct-labelled and the figures also appear as a stat.
function TrendTooltip({ active, payload }: TooltipPayload) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-n-200 bg-white px-2.5 py-1.5 text-xs shadow-sm">
      <p className="font-medium text-ink">{point.label}</p>
      <p className="mt-0.5 text-n-500">
        {point.rate}% · {point.present} of {point.total} present
      </p>
    </div>
  );
}

export function AttendanceTrendChart({ data }: { data: TrendPoint[] }) {
  const { primary } = useSchoolColors();

  // A line encodes value by position, not length, so a non-zero baseline is
  // legitimate here — and necessary: attendance sits in the 70–100 band, where a
  // 0-based axis flattens every real movement into a straight line. Floored to a
  // round number below the minimum and always topped at 100 so the ceiling is
  // never implied to be something else.
  const min = Math.min(...data.map((d) => d.rate));
  const floor = Math.max(0, Math.floor((min - 10) / 10) * 10);
  const last = data[data.length - 1];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 12, right: 16, left: -20, bottom: 0 }}>
        <CartesianGrid stroke="var(--n-100)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "var(--n-400)" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--n-400)" }}
          axisLine={false}
          tickLine={false}
          width={36}
          unit="%"
          domain={[floor, 100]}
        />
        <Tooltip content={<TrendTooltip />} cursor={{ stroke: "var(--n-200)", strokeWidth: 1 }} />
        <Line
          type="monotone"
          dataKey="rate"
          stroke={primary}
          strokeWidth={2}
          dot={{ r: 4, fill: primary, stroke: "white", strokeWidth: 2 }}
          activeDot={{ r: 5 }}
          // Only the endpoint is labelled — a number on every point is noise.
          // Recharts types x/y loosely (string | number), hence the coercion.
          label={(props: { index?: number; x?: string | number; y?: string | number }) =>
            props.index === data.length - 1 && last ? (
              <text
                x={Number(props.x ?? 0)}
                y={Number(props.y ?? 0) - 12}
                textAnchor="end"
                className="fill-ink text-[11px] font-medium"
              >
                {last.rate}%
              </text>
            ) : (
              <g />
            )
          }
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
