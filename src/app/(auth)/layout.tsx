import { AuthAside } from "@/features/auth/components/auth-aside";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="lg:grid lg:grid-cols-[480px_1fr] lg:h-screen">
      <AuthAside />
      {/* Only this side scrolls when a form/wizard is taller than the viewport —
          the aside (logo, quote, tagline) stays fixed in place on desktop. */}
      <main className="flex flex-col lg:h-screen lg:overflow-y-auto">{children}</main>
    </div>
  );
}
