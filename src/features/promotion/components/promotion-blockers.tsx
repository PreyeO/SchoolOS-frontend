import Link from "next/link";

interface Props {
  canPromote: boolean;
  hasClasses: boolean;
  sessionCount: number;
}

// The three reasons this screen can't be used yet. Returns null when none apply.
//
// The session one is the easy trap: promotion writes into a *different*
// session and the service refuses when source and target match, so a school
// still on its first session has nowhere to promote into. Saying that up front
// beats an arm picker that produces an unavoidable 400.
export function PromotionBlockers({ canPromote, hasClasses, sessionCount }: Props) {
  if (!canPromote) {
    return (
      <p className="rounded-lg border border-n-200 bg-n-50 px-3.5 py-2.5 text-sm text-n-600">
        Your role doesn&rsquo;t include permission to enrol or promote students. An
        administrator can grant it under Roles &amp; Permissions.
      </p>
    );
  }

  if (!hasClasses) {
    return <p className="text-sm text-n-400 italic">No classes yet.</p>;
  }

  if (sessionCount < 2) {
    return (
      <p className="rounded-lg border border-amber/40 bg-amber/10 px-3.5 py-2.5 text-sm text-ink">
        Promotion moves students into a different session, so you need next year&rsquo;s
        session before you can start. Add it in{" "}
        <Link href="/settings/sessions" className="text-primary hover:underline">
          Sessions &amp; Terms
        </Link>
        .
      </p>
    );
  }

  return null;
}
