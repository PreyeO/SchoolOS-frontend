import { AuthGuard } from "@/components/auth/auth-guard";
import { AppSidebar } from "@/features/dashboard/components/app-sidebar";
import { AppTopbar } from "@/features/dashboard/components/app-topbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-paper">
        <AppSidebar />
        <div className="flex flex-1 flex-col min-w-0">
          <AppTopbar />
          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
