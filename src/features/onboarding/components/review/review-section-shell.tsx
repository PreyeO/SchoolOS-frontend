export function ReviewSectionShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-n-200 p-4 space-y-3">
      <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-n-400">{title}</p>
      {children}
    </div>
  );
}
