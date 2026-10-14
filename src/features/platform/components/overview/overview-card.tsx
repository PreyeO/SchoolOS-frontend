import Link from "next/link";
import { ArrowRight, type LucideIcon } from "lucide-react";

interface Props {
  title: string;
  icon: LucideIcon;
  // Optional short fact beside the title ("3 of 37 states").
  aside?: string;
  // Optional link out to the full screen.
  link?: { href: string; label: string };
  children: React.ReactNode;
}

// The card shell every overview section shares, so headers line up.
export function OverviewCard({ title, icon: Icon, aside, link, children }: Props) {
  return (
    <section className="min-w-0 rounded-xl border border-n-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-n-100 px-4 py-3">
        <h2 className="flex items-center gap-2 font-display text-base font-semibold text-ink">
          <Icon className="size-4 text-primary" />
          {title}
        </h2>
        {link ? (
          <Link href={link.href} className="flex shrink-0 items-center gap-1 text-xs font-medium text-primary hover:underline">
            {link.label}
            <ArrowRight className="size-3.5" />
          </Link>
        ) : aside ? (
          <span className="shrink-0 text-xs text-n-500">{aside}</span>
        ) : null}
      </div>
      {children}
    </section>
  );
}
