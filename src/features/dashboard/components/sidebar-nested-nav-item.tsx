"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import type { NavItem } from "@/data/navigation";
import { isNavActive } from "../lib/is-nav-active";
import { SidebarNavItem } from "./sidebar-nav-item";

interface Props {
  // item.items is assumed non-empty — the caller (SidebarNavGroup) only
  // reaches for this component once persona filtering has left more than one
  // nested item; a single survivor renders as a plain SidebarNavItem instead.
  item: NavItem;
  pathname: string;
  onNavigate?: () => void;
}

// A row that expands in place rather than navigating — the disclosure
// counterpart to SidebarGroupHeader, but scoped to one item inside a group
// instead of the whole group, and self-contained rather than driven by the
// single open-group slot useSidebarAccordion tracks. Nesting two coordinated
// accordions under one label would only make sense once a second grouped item
// exists; until then each manages its own open state independently.
export function SidebarNestedNavItem({ item, pathname, onNavigate }: Props) {
  const children = item.items ?? [];
  const hasActiveChild = children.some((child) => isNavActive(child.href, pathname));

  // Adjusted during render on a pathname change, the same "derive state from
  // props" pattern useSidebarAccordion uses — an effect would open or close
  // this a frame after the route already changed.
  const [trackedPathname, setTrackedPathname] = useState(pathname);
  const [isOpen, setIsOpen] = useState(hasActiveChild);
  if (pathname !== trackedPathname) {
    setTrackedPathname(pathname);
    setIsOpen(hasActiveChild);
  }

  const Icon = item.icon;

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        className={cn(
          "group relative flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
          "focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:outline-none",
          hasActiveChild
            ? "text-foreground"
            : "text-foreground/60 hover:bg-muted/60 hover:text-foreground",
        )}
      >
        {hasActiveChild && (
          <span className="absolute top-1/2 left-0 h-4.5 w-0.75 -translate-y-1/2 rounded-full bg-primary" />
        )}
        <Icon className="size-4 shrink-0" />
        <span className="flex-1 truncate text-left">{item.label}</span>
        <ChevronDown
          className={cn(
            "size-3.5 shrink-0 transition-transform duration-200 ease-out",
            isOpen && "rotate-180",
          )}
        />
      </button>
      <div
        className={cn(
          "grid overflow-hidden transition-[grid-template-rows] duration-200 ease-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="space-y-0.5 py-0.5 pl-4">
            {children.map((child) => (
              <SidebarNavItem
                key={child.href}
                item={child}
                active={isNavActive(child.href, pathname)}
                collapsed={false}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
