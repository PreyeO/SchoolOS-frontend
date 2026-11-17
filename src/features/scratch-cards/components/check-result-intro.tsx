import { CalendarRange, LifeBuoy, UserRoundCheck } from "lucide-react";

const FACTS = [
  { icon: CalendarRange, text: "One card works for every term of its session." },
  { icon: UserRoundCheck, text: "It locks to the first child it's used for, so keep it for that child." },
  { icon: LifeBuoy, text: "Lost it? The school can issue a replacement." },
];

// A picture of the card, so a parent knows which number is which before
// typing. Example digits only; real cards come printed or by text message.
function CardPicture() {
  return (
    <div aria-hidden="true" className="relative w-full max-w-sm">
      <div className="relative overflow-hidden rounded-2xl bg-ink p-5 text-white shadow-[0_18px_40px_-18px_rgba(14,42,36,0.55)]">
        <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-14 -left-6 size-36 rounded-full bg-amber/10" />
        <p className="text-sm font-semibold">Your child&rsquo;s school</p>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/60">Result check card · 2026/2027</p>

        <div className="mt-6 space-y-3">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber">Serial</p>
            <p className="font-mono text-lg tracking-wider">ABCD-EFGH-IJ</p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber">PIN</p>
            {/* The scratch panel, half rubbed off. */}
            <div className="relative mt-1 inline-flex overflow-hidden rounded-md">
              <span className="px-2 py-1 font-mono text-lg tracking-[0.3em]">4821930576</span>
              <span className="absolute inset-y-0 right-0 w-[45%] bg-[linear-gradient(135deg,#c9ccc6,#eef0ec_45%,#b8bbb4)]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Two pieces rather than one, so the page can put the form between them on a
// phone: a parent shouldn't scroll past a picture and three tips to start typing.
export function CheckResultHeading() {
  return (
    <div>
      <p className="font-mono text-xs uppercase tracking-[0.15em] text-primary">Result checker</p>
      <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-ink text-balance sm:text-4xl">
        Check your child&rsquo;s result
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-n-600">
        Use the serial number and PIN from the card or text message your child&rsquo;s school gave you. You
        don&rsquo;t need an account.
      </p>
    </div>
  );
}

export function CheckResultHelp() {
  return (
    <div className="space-y-8">
      <CardPicture />

      <ul className="space-y-3">
        {FACTS.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-start gap-3 text-sm text-n-600">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Icon className="size-3.5 text-primary" />
            </span>
            <span className="pt-1">{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
