import type { AcademicSessionResponse } from "../../types";

export function SessionSummary({ session }: { session: AcademicSessionResponse }) {
  return (
    <div className="space-y-2">
      <p className="font-medium text-ink">{session.name}</p>
      <ul className="space-y-1">
        {session.periods.map((p) => (
          <li key={p.id} className="flex items-center justify-between text-sm gap-3">
            <span className={p.is_current ? "font-medium text-brand" : "text-n-600"}>
              {p.name}
              {p.is_current && " (current)"}
            </span>
            <span className="text-n-400 shrink-0">{p.start_date} – {p.end_date}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
