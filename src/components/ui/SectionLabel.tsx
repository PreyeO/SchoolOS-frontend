import { cn } from "@/lib/utils";

interface SectionLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function SectionLabel({ children, className }: SectionLabelProps) {
  return (
    <p
      className={cn(
        "font-mono text-xs tracking-[0.15em] uppercase opacity-60",
        className,
      )}
    >
      {children}
    </p>
  );
}
