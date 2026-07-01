import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface FieldWrapperProps {
  id: string;
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FieldWrapper({
  id,
  label,
  error,
  hint,
  required,
  children,
  className,
}: FieldWrapperProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="text-ink font-medium">
        {label}
        {required && (
          <span className="ml-0.5 text-clay" aria-hidden="true">
            *
          </span>
        )}
      </Label>
      {children}
      {hint && !error && (
        <p className="text-xs text-n-400">{hint}</p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
