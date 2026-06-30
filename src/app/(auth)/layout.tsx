import { AuthAside } from "@/features/auth/components/auth-aside";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[480px_1fr]">
      <AuthAside />
      <main className="flex flex-col">{children}</main>
    </div>
  );
}
