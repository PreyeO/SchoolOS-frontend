import Link from "next/link";

// Classes with no arm at all can't appear in the picker, because an assignment
// is always made against an arm.
//
// Said out loud rather than left as a silent omission: an admin who set up
// "JSS 1" without arms would otherwise look for it in the list, not find it,
// and have no way to tell whether that was a bug or a rule.
export function ArmlessClassesNotice({ classes }: { classes: { id: string; name: string }[] }) {
  if (classes.length === 0) return null;
  const one = classes.length === 1;

  return (
    <p className="rounded-lg border border-amber/40 bg-amber/10 px-3.5 py-2.5 text-xs text-ink">
      <span className="font-medium">
        {classes.length} {one ? "class isn't" : "classes aren't"} listed below
      </span>{" "}
      — {classes.map((k) => k.name).join(", ")} {one ? "has" : "have"} no arm, so nothing can be
      assigned to {one ? "it" : "them"} yet. Add an arm in{" "}
      <Link href="/classes" className="text-primary hover:underline">
        Classes &amp; Arms
      </Link>{" "}
      to bring {one ? "it" : "them"} in.
    </p>
  );
}
