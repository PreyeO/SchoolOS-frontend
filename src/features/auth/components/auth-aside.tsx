import Link from "next/link";

export function AuthAside() {
  return (
    <aside className="hidden lg:flex flex-col justify-between bg-ink p-10 xl:p-14 lg:h-screen">
      <Link
        href="/"
        className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber rounded"
      >
        <span className="font-display text-2xl font-bold text-paper tracking-tight">
          School<span className="text-amber">OS</span>
        </span>
      </Link>

      <div>
        <p className="font-mono text-[11px] tracking-[0.15em] uppercase text-paper/40 mb-6">
          Built for Nigerian schools
        </p>
        <blockquote className="font-display text-3xl xl:text-4xl font-semibold text-paper leading-tight">
          &ldquo;Results, fees, and attendance &mdash; running smoothly.&rdquo;
        </blockquote>
        <p className="mt-6 text-paper/60 leading-relaxed max-w-sm">
          Compile a whole term&apos;s results in an afternoon. Collect fees
          online. Keep every parent updated automatically.
        </p>
      </div>

      <p className="font-mono text-xs text-paper/30 tracking-wide">
        Built with Nigerian school owners, and we answer the phone.
      </p>
    </aside>
  );
}
