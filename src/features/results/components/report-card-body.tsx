import { Award, Lock } from "lucide-react";

import type { ReportCard, TraitCategory } from "../types";

const CATEGORY_LABEL: Record<TraitCategory, string> = {
  affective: "Affective",
  psychomotor: "Psychomotor",
};

// The structured report card as data: tiles, subject table, trait chips, remarks.
// Split from the dialog so the dialog is just fetch state and framing.
export function ReportCardBody({ data }: { data: ReportCard }) {
  const traitsByCategory = (["affective", "psychomotor"] as TraitCategory[])
    .map((category) => ({
      category,
      ratings: (data.trait_ratings ?? []).filter((r) => r.trait_category === category),
    }))
    .filter((group) => group.ratings.length > 0);

  return (
    <div className="space-y-4">
      {/* Positions and averages only exist once the broadsheet is locked, so
          their absence is stated rather than shown as blanks. */}
      {data.summary ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total", value: Number(data.summary.total_score) },
            { label: "Average", value: `${Number(data.summary.average_score)}%` },
            { label: "Position in class", value: data.summary.position_in_arm ?? "—" },
            {
              label: "Cumulative",
              value: data.summary.cumulative_average
                ? `${Number(data.summary.cumulative_average)}%`
                : "—",
            },
          ].map((tile) => (
            <div key={tile.label} className="rounded-lg border border-n-200 p-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-n-400">
                {tile.label}
              </p>
              <p className="mt-1 font-display text-lg font-bold text-ink">{tile.value}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="flex items-start gap-2 rounded-lg border border-n-200 bg-n-50 px-3.5 py-2.5 text-xs text-n-600">
          <Lock className="mt-0.5 size-3.5 shrink-0 text-n-400" />
          <span>
            Positions and averages are computed when the class is published. Subject scores
            below are current.
          </span>
        </p>
      )}

      {data.subjects.length === 0 ? (
        <p className="py-6 text-center text-sm text-n-400 italic">
          No subject results yet for this term.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-n-200 text-left">
                <th scope="col" className="py-2 pr-3 font-medium text-n-500">Subject</th>
                <th scope="col" className="py-2 pr-3 text-right font-medium text-n-500">Score</th>
                <th scope="col" className="py-2 pr-3 text-right font-medium text-n-500">Grade</th>
                <th scope="col" className="py-2 text-right font-medium text-n-500">Position</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-n-100">
              {data.subjects.map((s) => (
                <tr key={s.id}>
                  <td className="py-2 pr-3 text-ink">{s.subject_name}</td>
                  <td className="py-2 pr-3 text-right tabular-nums text-ink">
                    {Number(s.total_score)}
                  </td>
                  <td className="py-2 pr-3 text-right text-ink">{s.grade ?? "—"}</td>
                  <td className="py-2 text-right tabular-nums text-n-500">
                    {s.subject_position_in_arm ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {traitsByCategory.map((group) => (
        <div key={group.category}>
          <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-n-400">
            {CATEGORY_LABEL[group.category]}
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {group.ratings.map((r) => (
              <li
                key={r.id}
                className="flex items-center gap-1.5 rounded-full border border-n-200 px-2.5 py-1 text-xs text-ink"
              >
                <Award className="size-3 shrink-0 text-n-400" />
                {r.trait_name}
                <span className="font-medium tabular-nums">{r.rating}/5</span>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {(data.remark?.class_teacher_remark || data.remark?.principal_remark) && (
        <div className="space-y-2 border-t border-n-100 pt-3">
          {data.remark.class_teacher_remark && (
            <p className="text-sm text-n-600">
              <span className="font-medium text-ink">Form teacher:</span>{" "}
              {data.remark.class_teacher_remark}
            </p>
          )}
          {data.remark.principal_remark && (
            <p className="text-sm text-n-600">
              <span className="font-medium text-ink">Principal:</span>{" "}
              {data.remark.principal_remark}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
