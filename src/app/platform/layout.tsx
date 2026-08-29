import { PlatformShell } from "@/features/platform/components/platform-shell";

// /platform sits outside the (dashboard) route group deliberately — that
// group's layout applies DashboardShell, which is school-scoped and would
// break for a platform admin. This gives the platform tree its own shell while
// still inheriting the root layout's providers (QueryClient, theme, fonts,
// Toaster).
export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return <PlatformShell>{children}</PlatformShell>;
}
