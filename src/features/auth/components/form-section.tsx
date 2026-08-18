// The create-school form's own section shell.
//
// Deliberately not components/ui/SectionLabel, which is a shade lighter
// (text-xs, opacity-60 rather than text-[11px], text-n-400). Kept as its own
// definition so splitting the form across files can't quietly restyle it —
// these two were previously local to create-school-form.tsx.

export function Section({ children }: { children: React.ReactNode }) {
  return <section className="space-y-4">{children}</section>;
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11px] tracking-[0.15em] uppercase text-n-400">{children}</p>
  );
}
