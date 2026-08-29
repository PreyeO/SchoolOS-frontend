"use client";

import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen, ShieldCheck } from "lucide-react";

import { PLATFORM_NAV_GROUPS } from "@/data/nav/platform";
import { useSidebarAccordion } from "@/features/dashboard/hooks/use-sidebar-accordion";
import { SidebarNavGroup } from "@/features/dashboard/components/sidebar-nav-group";
import { cn } from "@/lib/utils";

interface Props {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

// The staff console's sidebar.
//
// A fork of AppSidebar rather than a reuse, because that component reads
// school state three ways (useSchoolStore, useNavGroups, useTrialStatus) and
// none of it exists for a platform admin — useNavGroups in particular would
// hand them the entire school-admin nav via its ["admin"] fallback.
//
// The pieces that do the actual work — SidebarNavGroup and everything under
// it, plus useSidebarAccordion — are pure and prop-driven, so they're reused
// verbatim against PLATFORM_NAV_GROUPS.
//
// data-surface="ink" with no --shell-* vars set: every consumer of those uses
// var(name, fallback), so this resolves to the fixed SchoolOS pine. That's
// the right look here — a staff console shouldn't wear any one school's brand.
export function PlatformSidebar({ collapsed, onToggleCollapse }: Props) {
  const pathname = usePathname();
  const { openGroup, toggleGroup } = useSidebarAccordion(PLATFORM_NAV_GROUPS, pathname);

  return (
    <aside
      data-surface="ink"
      className={cn(
        "hidden lg:flex flex-col h-screen sticky top-0 shrink-0 border-r border-border transition-[width] duration-200",
        collapsed ? "w-[68px]" : "w-64",
      )}
    >
      <div className="flex h-14 items-center gap-2.5 border-b border-border px-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/20">
          <ShieldCheck className="size-4 text-primary" />
        </span>
        {!collapsed && (
          <span className="min-w-0">
            <span className="block truncate font-display text-sm font-semibold text-foreground">
              SchoolOS
            </span>
            <span className="block truncate text-[10px] uppercase tracking-[0.14em] text-foreground/50">
              Platform
            </span>
          </span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-2">
        {PLATFORM_NAV_GROUPS.map((group) => (
          <SidebarNavGroup
            key={group.label}
            group={group}
            pathname={pathname}
            collapsed={collapsed}
            isOpen={openGroup === group.label}
            onToggle={() => toggleGroup(group.label)}
          />
        ))}
      </nav>

      <div className="border-t border-border p-2">
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-foreground/60 transition-colors hover:bg-muted/60 hover:text-foreground",
            collapsed && "justify-center px-0",
          )}
        >
          {collapsed ? (
            <PanelLeftOpen className="size-4 shrink-0" />
          ) : (
            <PanelLeftClose className="size-4 shrink-0" />
          )}
          {!collapsed && "Collapse"}
        </button>
      </div>
    </aside>
  );
}
