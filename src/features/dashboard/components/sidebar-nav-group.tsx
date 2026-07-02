"use client";

import type { NavGroup } from "@/data/navigation";
import { SidebarNavItem } from "./sidebar-nav-item";

interface Props {
  group: NavGroup;
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
}

function isActive(href: string, pathname: string): boolean {
  return href === "/dashboard" ? pathname === href : pathname.startsWith(href);
}

export function SidebarNavGroup({ group, pathname, collapsed, onNavigate }: Props) {
  return (
    <div className="space-y-0.5">
      {!collapsed && (
        <p className="px-2.5 pb-1.5 pt-3 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-foreground/35">
          {group.label}
        </p>
      )}
      {group.items.map((item) => (
        <SidebarNavItem
          key={item.href}
          item={item}
          active={isActive(item.href, pathname)}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}
