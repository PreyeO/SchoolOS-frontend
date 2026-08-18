import * as React from "react"

import { cn } from "@/lib/utils"

// A native <select>, styled to match Input.
//
// Native rather than a Radix listbox on purpose: on a phone this opens the OS
// picker, which is faster to operate one-handed and fully accessible for free —
// and every current use is a short, flat list of classes, subjects or statuses.
// Reach for a custom listbox only when a case needs search or rich options.
//
// `text-base md:text-sm` mirrors Input and is the important part: iOS Safari
// zooms the whole page when a control with a font-size under 16px receives
// focus, and the class picker sits at the top of screens teachers use daily.
// Nineteen files previously hand-copied a class string; seventeen of them had
// text-sm and so zoomed.
function Select({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="select"
      className={cn(
        "h-9 w-full min-w-0 rounded-lg border border-input bg-background px-2 py-1 text-base text-ink transition-colors outline-none",
        "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60",
        "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
        "md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Select }
