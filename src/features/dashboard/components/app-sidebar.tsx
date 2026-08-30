"use client";

import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen, Sparkles, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";
import { useSchoolStore } from "@/stores/school-store";
import { useAccessStatus } from "../hooks/use-access-status";
import { useNavGroups } from "../hooks/use-nav-groups";
import { useSidebarAccordion } from "../hooks/use-sidebar-accordion";
import { SidebarNavGroup } from "./sidebar-nav-group";
import { SchoolLogo } from "./school-logo";

interface Props {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function AppSidebar({ collapsed, onToggleCollapse }: Props) {
  const pathname = usePathname();
  const school = useSchoolStore((s) => s.currentSchool);
  const navGroups = useNavGroups();
  const { openGroup, toggleGroup } = useSidebarAccordion(navGroups, pathname);
  const access = useAccessStatus();

  return (
    <aside
      data-surface="ink"
      className={cn(
        "hidden lg:flex flex-col h-screen sticky top-0 shrink-0 border-r border-border transition-[width] duration-200",
        collapsed ? "w-17" : "w-64",
      )}
    >
      <div className="flex h-14 items-center gap-2.5 px-3 border-b border-border">
        <SchoolLogo school={school} className="size-7" />
        {!collapsed && (
          <span className="font-display font-semibold text-sm text-foreground truncate">
            {school?.name ?? "SchoolOS"}
          </span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-2">
        {navGroups.map((group) => (
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

      <div className="border-t border-border p-2 space-y-1">
        {/* Null for anyone who can't see billing — the backend omits those
            fields for non-admins, so a teacher gets no badge at all. */}
        {access?.isTrialing && !collapsed && (
          <div className="flex items-center gap-2 rounded-lg bg-muted px-2.5 py-2 text-xs text-foreground/70">
            <Sparkles className="size-3.5 shrink-0 text-primary" />
            <span className="flex-1">
              {access.daysLeft === null
                ? "On trial"
                : access.daysLeft === 0
                  ? "Trial ends today"
                  : `Trial: ${access.daysLeft} day${access.daysLeft === 1 ? "" : "s"} left`}
            </span>
          </div>
        )}
        {/* The state the old mock could never show. An expired school is
            already having its writes refused, so this is the one billing
            state that genuinely needs surfacing. */}
        {access?.isExpired && !collapsed && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/15 px-2.5 py-2 text-xs text-foreground">
            <TriangleAlert className="size-3.5 shrink-0 text-destructive" />
            <span className="flex-1">Access expired</span>
          </div>
        )}
        {/* No Settings link here: the sidebar's own Settings group already
            lists every settings page, so this was a second door to the same
            rooms — and one that pointed only at School Profile. */}
        <button
          type="button"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-foreground/60 hover:bg-muted/60 hover:text-foreground transition-colors",
            collapsed && "justify-center px-0",
          )}
        >
          {collapsed ? <PanelLeftOpen className="size-4 shrink-0" /> : <PanelLeftClose className="size-4 shrink-0" />}
          {!collapsed && "Collapse"}
        </button>
      </div>
    </aside>
  );
}
