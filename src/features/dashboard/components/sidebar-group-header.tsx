"use client";

import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import type { NavGroup } from "@/data/navigation";

interface Props {
  group: NavGroup;
  isOpen: boolean;
  hasActiveChild: boolean;
  onToggle: () => void;
}

export function SidebarGroupHeader({ group, isOpen, hasActiveChild, onToggle }: Props) {
  const Icon = group.icon;

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      className={cn(
        // Same mobile-drawer-vs-fixed-sidebar sizing as SidebarNavItem — see
        // its comment.
        "flex w-full items-center gap-2 rounded-lg px-2.5 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.12em] transition-colors lg:py-2",
        hasActiveChild ? "text-foreground/70" : "text-foreground/35 hover:text-foreground/60",
      )}
    >
      <Icon className="size-3.5 shrink-0" />
      <span className="flex-1 truncate text-left">{group.label}</span>
      {hasActiveChild && !isOpen && (
        <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-primary" />
      )}
      <ChevronDown
        className={cn("size-3.5 shrink-0 transition-transform duration-200 ease-out", isOpen && "rotate-180")}
      />
    </button>
  );
}
