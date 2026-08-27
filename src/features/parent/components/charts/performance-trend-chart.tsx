"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { useSchoolColors } from "@/lib/school/use-school-colors";
import { ordinal } from "@/lib/text/ordinal";

import type { TermPoint } from "../../hooks/use-child-performance";

interface TooltipPayload {
  active?: boolean;
  payload?: { payload: TermPoint }[];
}

function TrendTooltip({ active, payload }: TooltipPayload) {
  if (!active || !payload?.length) return null;
  const point = payload[0].payload;
  return (
    <div className="rounded-lg border border-n-200 bg-white px-2.5 py-1.5 text-xs shadow-sm">
      <p className="font-medium text-ink">{point.label}</p>
      <p className="mt-0.5 text-n-500">
        {point.average}%
        {point.position !== null && <> · {ordinal(point.position)} in class</>}
      </p>
    </div>
  );
}

// A child's average, term by term.
//
// Same construction as the teacher dashboard's attendance trend, for the same
// reason: a line encodes value by position rather than length, so a non-zero
// baseline is legitimate — and necessary here, because averages cluster in a
// narrow band where a 0-based axis flattens every real movement flat. Floored
// to a round number below the lowest point and always topped at 100, so the
// ceiling is never implied to be something other than full marks.
export function PerformanceTrendChart({ data }: { data: TermPoint[] }) {
  const { primary } = useSchoolColors();

  const min = Math.min(...data.map((d) => d.average));
  const floor = Math.max(0, Math.floor((min - 10) / 10) * 10);
  const last = data[data.length - 1];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 16, right: 16, left: -20, bottom: 0 }}>
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
          dataKey="average"
          stroke={primary}
          strokeWidth={2}
          dot={{ r: 4, fill: primary, stroke: "white", strokeWidth: 2 }}
          activeDot={{ r: 5 }}
          // Only the latest term is labelled — a number on every point is noise,
          // and the tooltip carries the rest. Recharts types x/y loosely.
          label={(props: { index?: number; x?: string | number; y?: string | number }) =>
            props.index === data.length - 1 && last ? (
              <text
                x={Number(props.x ?? 0)}
                y={Number(props.y ?? 0) - 12}
                textAnchor="end"
                className="fill-ink text-[11px] font-medium"
              >
                {last.average}%
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
