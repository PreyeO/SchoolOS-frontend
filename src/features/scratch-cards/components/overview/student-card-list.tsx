"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ContactFormDialog } from "@/features/guardian-contacts/components/contact-form-dialog";

import { SCRATCH_CARDS_KEY } from "../../hooks/use-scratch-card-queries";
import { filterStudents, type CardOverview, type OverviewFilter, type OverviewStudent } from "../../lib/card-overview";
import { StudentCardRow } from "./student-card-row";

const PAGE = 50;

interface Props {
  overview: CardOverview;
  sessionId: string;
}

// Students, not cards: one row each, from the overview's single preview (so
// filtering and search are over that one snapshot, not paginated pages).
// Rendered 50 at a time so a big school isn't a thousand rows at once.
export function StudentCardList({ overview: o, sessionId }: Props) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<OverviewFilter>(o.waiting ? "waiting" : "all");
  const [search, setSearch] = useState("");
  const [shown, setShown] = useState(PAGE);
  const [adding, setAdding] = useState<OverviewStudent | null>(null);
  const rows = filterStudents(o.students, filter, search);

  const chips: { key: OverviewFilter; label: string }[] = [
    { key: "waiting", label: `Waiting ${o.waiting}` },
    { key: "needs_number", label: `Need a number ${o.needsNumber}` },
    { key: "has_card", label: `Have a card ${o.haveCard}` },
    { key: "all", label: `All ${o.total}` },
  ];

  return (
    <section aria-labelledby="students-heading" className="overflow-hidden rounded-2xl border border-n-200 bg-white">
      <div className="flex flex-wrap items-center gap-3 border-b border-n-100 px-4 py-4 sm:px-6">
        <h2 id="students-heading" className="mr-auto text-sm font-semibold text-ink">Students</h2>
        <Input
          aria-label="Search students"
          placeholder="Name or admission no."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setShown(PAGE); }}
          className="h-9 w-full sm:w-56"
        />
        <div role="group" aria-label="Show" className="flex w-full flex-wrap gap-2">
          {chips.map((c) => (
            <button
              key={c.key}
              type="button"
              aria-pressed={filter === c.key}
              onClick={() => { setFilter(c.key); setShown(PAGE); }}
              className="min-h-9 rounded-full border border-n-200 px-3.5 text-sm font-medium text-ink aria-pressed:border-primary aria-pressed:bg-primary aria-pressed:text-white"
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="px-6 py-6 text-sm text-n-400 italic">{search ? "No student matches this search." : "Nobody here."}</p>
      ) : (
        <ul className="divide-y divide-n-100">
          {rows.slice(0, shown).map((s) => (
            <StudentCardRow key={s.student_id} student={s} sessionId={sessionId} onAddNumber={setAdding} />
          ))}
        </ul>
      )}
      {rows.length > shown && (
        <div className="border-t border-n-100 px-6 py-3">
          <Button type="button" variant="ghost" size="sm" onClick={() => setShown((x) => x + PAGE)}>
            Show more ({rows.length - shown} left)
          </Button>
        </div>
      )}

      <ContactFormDialog
        key={adding?.student_id ?? "closed"}
        open={!!adding}
        student={adding ? { id: adding.student_id, name: adding.student_name, admission_number: adding.admission_number } : undefined}
        onClose={() => setAdding(null)}
        // The overview is a snapshot: refresh it so this student moves to Waiting.
        onSaved={() => queryClient.invalidateQueries({ queryKey: [...SCRATCH_CARDS_KEY, "overview"] })}
      />
    </section>
  );
}
