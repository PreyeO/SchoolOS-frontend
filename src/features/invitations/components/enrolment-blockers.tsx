import Link from "next/link";

interface Props {
  // Undefined while classes are still loading — no blocker is claimed until
  // we actually know.
  hasArms: boolean | undefined;
  sessionName: string | null | undefined;
}

// The two conditions that make student creation fail server-side.
//
// Shown up front rather than on submit: both are fixed on another screen by
// someone who may not be the person filling this form in, and discovering that
// after typing a name, admission number and password is a wasted trip. The
// submit button is disabled on the same conditions.
export function EnrolmentBlockers({ hasArms, sessionName }: Props) {
  return (
    <>
      {hasArms === false && (
        <p className="rounded-lg border border-amber/40 bg-amber/10 px-3.5 py-2.5 text-xs text-ink">
          No class has an arm to enrol into yet. Add one in{" "}
          <Link href="/classes" className="text-primary hover:underline">
            Classes &amp; Arms
          </Link>{" "}
          first.
        </p>
      )}

      {!sessionName && (
        <p className="rounded-lg border border-amber/40 bg-amber/10 px-3.5 py-2.5 text-xs text-ink">
          No academic term is marked current, so the enrolment can&rsquo;t be created. Set one in{" "}
          <Link href="/settings/sessions" className="text-primary hover:underline">
            Sessions &amp; Terms
          </Link>{" "}
          first.
        </p>
      )}
    </>
  );
}
