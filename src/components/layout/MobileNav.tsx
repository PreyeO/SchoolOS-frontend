import Link from "next/link";

import { NAV_CTA_PRIMARY, NAV_CTA_SECONDARY, NAV_LINKS } from "@/data/nav";

import { Button } from "../ui/button";

interface MobileNavProps {
  onClose: () => void;
}

export function MobileNav({ onClose }: MobileNavProps) {
  return (
    <div className="flex flex-col h-full pt-2 pb-6">
      <div className="mb-8 px-1">
        <span className="font-display text-xl font-bold text-ink">
          School<span className="text-brand">OS</span>
        </span>
      </div>

      <nav className="flex flex-col gap-0.5 flex-1">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="px-3 py-3 text-base font-medium text-n-700 hover:text-ink hover:bg-n-100 rounded-lg transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="flex flex-col gap-3 pt-4 border-t border-n-200">
        <Link
          href={NAV_CTA_SECONDARY.href}
          onClick={onClose}
          className="py-3 text-center text-base font-medium text-n-600 hover:text-ink transition-colors"
        >
          {NAV_CTA_SECONDARY.label}
        </Link>
        <Button
          asChild
          className="bg-amber hover:bg-amber/90 text-ink font-semibold w-full h-12"
        >
          <Link href={NAV_CTA_PRIMARY.href} onClick={onClose}>
            {NAV_CTA_PRIMARY.label}
          </Link>
        </Button>
      </div>
    </div>
  );
}
