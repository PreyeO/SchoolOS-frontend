"use client";

import { cn } from "@/lib/utils";
import type { NavGroup } from "@/data/navigation";
import { isNavActive } from "../lib/is-nav-active";
import { SidebarNavItem } from "./sidebar-nav-item";
import { SidebarGroupHeader } from "./sidebar-group-header";
import { SidebarGroupFlyout } from "./sidebar-group-flyout";

interface Props {
  group: NavGroup;
  pathname: string;
  collapsed: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}

export function SidebarNavGroup({ group, pathname, collapsed, isOpen, onToggle, onNavigate }: Props) {
  const hasActiveChild = group.items.some((item) => isNavActive(item.href, pathname));

  // Single-item groups (Overview) are just a link — no accordion needed.
  if (group.items.length <= 1) {
    return (
      <div className="space-y-0.5">
        {group.items.map((item) => (
          <SidebarNavItem
            key={item.href}
            item={item}
            active={isNavActive(item.href, pathname)}
            collapsed={collapsed}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    );
  }

  if (collapsed) {
    return <SidebarGroupFlyout group={group} pathname={pathname} hasActiveChild={hasActiveChild} onNavigate={onNavigate} />;
  }

  return (
    <div className="space-y-0.5">
      <SidebarGroupHeader group={group} isOpen={isOpen} hasActiveChild={hasActiveChild} onToggle={onToggle} />
      <div
        className={cn(
          "grid overflow-hidden transition-[grid-template-rows] duration-200 ease-out",
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="space-y-0.5 pb-1">
            {group.items.map((item) => (
              <SidebarNavItem
                key={item.href}
                item={item}
                active={isNavActive(item.href, pathname)}
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
