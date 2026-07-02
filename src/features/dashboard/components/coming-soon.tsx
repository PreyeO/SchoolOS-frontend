import { Construction, type LucideIcon } from "lucide-react";

import { getNavItemByHref } from "@/data/navigation";

interface Props {
  href: string;
  label?: string;
  description?: string;
  icon?: LucideIcon;
}

export function ComingSoon({ href, label, description, icon }: Props) {
  const item = getNavItemByHref(href);
  const Icon = icon ?? item?.icon ?? Construction;

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-6">
      <div className="flex size-14 items-center justify-center rounded-2xl bg-brand/10">
        <Icon className="size-6 text-brand" />
      </div>
      <h1 className="mt-5 font-display text-2xl font-bold text-ink">
        {label ?? item?.label ?? "Coming soon"}
      </h1>
      <p className="mt-2 max-w-md text-sm text-n-500 leading-relaxed">
        {description ?? item?.description ?? "This module is on our roadmap and will be available soon."}
      </p>
      <span className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-amber/30 bg-amber/10 px-3 py-1 text-xs font-medium text-ink">
        <Construction className="size-3.5 text-amber" />
        In development
      </span>
    </div>
  );
}
