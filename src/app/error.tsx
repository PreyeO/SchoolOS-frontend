"use client";
// Placeholder error boundary. TODO (Phase 2): design and implement.
export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center">
      <div className="text-center space-y-4">
        <p className="text-muted-foreground">Something went wrong.</p>
        <button onClick={reset} className="underline text-sm">
          Try again
        </button>
      </div>
    </main>
  );
}
