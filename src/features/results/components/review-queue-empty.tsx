// Two different nothings, told apart because they need opposite responses:
// nothing submitted is a nudge to the teachers, nothing matching is a nudge to
// widen the filters.
export function ReviewQueueEmpty({ filtered }: { filtered: boolean }) {
  return (
    <div className="rounded-xl border border-n-200 bg-white p-8 text-center">
      <p className="text-sm font-medium text-ink">
        {filtered ? "Nothing matches those filters" : "Nothing submitted yet"}
      </p>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-n-500">
        {filtered
          ? "Try another class, subject or term."
          : "A subject appears here once its teacher has entered and saved at least one score."}
      </p>
    </div>
  );
}
