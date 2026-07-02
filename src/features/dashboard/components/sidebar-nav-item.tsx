"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/data/navigation";

interface Props {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onNavigate?: () => void;
}

export function SidebarNavItem({ item, active, collapsed, onNavigate }: Props) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      title={collapsed ? item.label : undefined}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
        collapsed && "justify-center px-0",
        active ? "bg-muted text-foreground" : "text-foreground/60 hover:bg-muted/60 hover:text-foreground",
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-4.5 w-[3px] -translate-y-1/2 rounded-full bg-primary" />
      )}
      <Icon className="size-4 shrink-0" />
      {!collapsed && (
        <>
          <span className="truncate">{item.label}</span>
          {item.soon && (
            <Badge variant="secondary" className="ml-auto shrink-0 opacity-80">
              Soon
            </Badge>
          )}
        </>
      )}
    </Link>
  );
}
