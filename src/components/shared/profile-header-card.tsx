interface Props {
  avatar: React.ReactNode;
  name: string;
  // Status pills beside the name (enrolled, inactive, former parent…).
  badges?: React.ReactNode;
  // Contact lines under the name — email, phone. Null entries are skipped.
  details?: (string | null | undefined)[];
  // Buttons for the record. Wrap onto their own row on a phone.
  actions?: React.ReactNode;
}

// The header card on the student, teacher, admin and parent detail pages.
//
// One component because all four had the same phone overflow (2026-10-11): the
// text column sat in a flex row with no min-w-0, so it couldn't shrink below
// its longest word. A synthetic student email
// (student.ADM.slug@internal.myschoolos.io) is one unbreakable string, so it
// pushed the name's badge and itself past the card edge. The fixes, each
// load-bearing:
//   - min-w-0 on every flex child that holds text, so it can shrink at all;
//   - the badge row wraps, so a pill drops under a long name rather than
//     off the card;
//   - the details break anywhere (break-all), so a long email wraps inside
//     the card and stays fully readable — truncating it would hide the part
//     that tells two internal addresses apart, with no hover on a phone.
//   - actions stack under the identity below sm, and sit right above it.
export function ProfileHeaderCard({ avatar, name, badges, details = [], actions }: Props) {
  const lines = details.filter((d): d is string => !!d);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-n-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <div className="shrink-0">{avatar}</div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <h1 className="min-w-0 wrap-break-word font-display text-xl font-bold text-ink">{name}</h1>
            {badges}
          </div>
          {lines.map((line) => (
            <p key={line} className="mt-0.5 break-all text-sm text-n-500">
              {line}
            </p>
          ))}
        </div>
      </div>
      {/* empty:hidden — an actions component can render nothing for a reader
          with no rights (a teacher on a student), and an empty row would
          still add the column gap. */}
      {actions && (
        <div className="flex flex-wrap items-center gap-2 empty:hidden sm:justify-end">{actions}</div>
      )}
    </div>
  );
}
