import { Info } from "lucide-react";

interface Props {
  children: React.ReactNode;
}

export function PrefillNotice({ children }: Props) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-amber/30 bg-amber/10 px-3 py-2.5">
      <Info className="mt-0.5 size-4 shrink-0 text-amber" />
      <p className="text-xs text-ink/80 leading-relaxed">{children}</p>
    </div>
  );
}
