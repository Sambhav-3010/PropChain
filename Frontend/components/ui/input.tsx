import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full min-w-0 rounded-xl bg-background px-4 py-2 text-base transition-all duration-200 outline-none",
        "shadow-[inset_3px_3px_6px_var(--neu-shadow-dark),inset_-3px_-3px_6px_var(--neu-shadow-light)]",
        "placeholder:text-muted-foreground",
        "focus:shadow-[inset_3px_3px_6px_var(--neu-shadow-dark),inset_-3px_-3px_6px_var(--neu-shadow-light),0_0_0_3px_var(--ring)]",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "file:text-foreground file:inline-flex file:h-8 file:border-0 file:bg-transparent file:text-sm file:font-medium",
        "md:text-sm",
        "aria-invalid:ring-destructive/30 aria-invalid:shadow-[inset_3px_3px_6px_var(--neu-shadow-dark),inset_-3px_-3px_6px_var(--neu-shadow-light),0_0_0_2px_var(--destructive)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
