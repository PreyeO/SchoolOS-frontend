import { Fragment } from "react";

// The only markup a legal document's plain-string content needs is emphasis —
// AKỤ TECHNOLOGY LTD, "the school is the data controller", an email address —
// so this handles exactly **bold**, deliberately nothing else. Reaching for a
// markdown library here would parse a syntax these pages don't use (links,
// headings, lists all have their own typed fields on LegalSection already) for
// one feature actually needed.
//
// matchAll rather than a module-level regex + exec loop: a shared `/g` regex
// carries mutable state on `lastIndex` across calls, which is exactly the kind
// of thing React's compiler flags when it's mutated during render (and two
// renders interleaving on the same object is a real bug, not a theoretical
// one). matchAll builds its own iterator per call, so there is nothing shared
// to step on.
export function LegalRichText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let key = 0;

  for (const match of text.matchAll(/\*\*([^*]+)\*\*/g)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      parts.push(<Fragment key={key++}>{text.slice(lastIndex, index)}</Fragment>);
    }
    parts.push(
      <strong key={key++} className="font-semibold text-ink">
        {match[1]}
      </strong>,
    );
    lastIndex = index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(<Fragment key={key++}>{text.slice(lastIndex)}</Fragment>);
  }

  return <>{parts}</>;
}
