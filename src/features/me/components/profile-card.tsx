// The card shell every profile section uses. Two columns on anything wider
// than a phone, matching the Student/Staff detail pages so this page doesn't
// read as a different app.
export function ProfileCard({
  title,
  action,
  children,
}: {
  title: string;
  // e.g. the Account card's Edit, offered only where an update route exists.
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-n-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        {action}
      </div>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}
