"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  LogOut,
  LayoutDashboard,
  Users,
  Briefcase,
  CreditCard,
  Receipt,
  FileText,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuthStore } from "@/stores/auth-store";
import { useSchoolStore } from "@/stores/school-store";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/students", label: "Students", icon: Users },
  { href: "/staff", label: "Staff", icon: Briefcase },
  { href: "/fees", label: "Fees", icon: CreditCard },
  { href: "/payments", label: "Payments", icon: Receipt },
  { href: "/report-card", label: "Report Cards", icon: FileText },
];

export function AppTopbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const school = useSchoolStore((s) => s.currentSchool);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const clearSchool = useSchoolStore((s) => s.clearSchool);

  function handleLogout() {
    clearAuth();
    clearSchool();
    window.location.href = "/login";
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-n-200 bg-white px-4 lg:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-56 p-0">
            <div className="flex h-14 items-center px-4 border-b border-n-200">
              <span className="font-display font-semibold text-sm text-ink truncate">
                {school?.name ?? "SchoolOS"}
              </span>
            </div>
            <nav className="px-2 py-4 space-y-0.5">
              {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      active ? "bg-brand/10 text-brand" : "text-n-500 hover:bg-n-50 hover:text-ink",
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    {label}
                  </Link>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>
        <span className="hidden lg:block font-display font-semibold text-sm text-n-400">
          {school?.name ?? "SchoolOS"}
        </span>
      </div>
      <Button variant="ghost" size="sm" onClick={handleLogout} className="text-n-500 gap-1.5">
        <LogOut className="size-4" /> Log out
      </Button>
    </header>
  );
}
