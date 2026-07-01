"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CreditCard,
  Receipt,
  FileText,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useSchoolStore } from "@/stores/school-store";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/students", label: "Students", icon: Users },
  { href: "/staff", label: "Staff", icon: Briefcase },
  { href: "/fees", label: "Fees", icon: CreditCard },
  { href: "/payments", label: "Payments", icon: Receipt },
  { href: "/report-card", label: "Report Cards", icon: FileText },
];

export function AppSidebar() {
  const pathname = usePathname();
  const school = useSchoolStore((s) => s.currentSchool);

  /* Using <img> intentionally — logo is a local blob URL, next/image requires configured remote domains */
  const logoEl = school?.logoUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={school.logoUrl} alt={school.name ?? "School logo"} className="size-7 rounded object-cover shrink-0" />
  ) : (
    <div
      className="size-7 rounded flex items-center justify-center text-white text-xs font-bold shrink-0"
      style={{ backgroundColor: school?.primaryColor ?? "#1E5B4F" }}
    >
      {school?.name?.[0]?.toUpperCase() ?? "S"}
    </div>
  );

  return (
    <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r border-n-200 bg-white min-h-screen sticky top-0">
      <div
        className="flex h-14 items-center gap-2.5 px-4 border-b border-n-200"
        style={{ borderLeftColor: school?.primaryColor ?? "#1E5B4F", borderLeftWidth: 3 }}
      >
        {logoEl}
        <span className="font-display font-semibold text-sm text-ink leading-tight truncate">
          {school?.name ?? "SchoolOS"}
        </span>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-brand/10 text-brand"
                  : "text-n-500 hover:bg-n-50 hover:text-ink",
              )}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
