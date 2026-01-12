import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  {
    variants: {
      variant: {
        default:
          "bg-background text-foreground shadow-[5px_5px_10px_var(--neu-shadow-dark),-5px_-5px_10px_var(--neu-shadow-light)] hover:shadow-[6px_6px_12px_var(--neu-shadow-dark),-6px_-6px_12px_var(--neu-shadow-light)] active:shadow-[inset_3px_3px_6px_var(--neu-shadow-dark),inset_-3px_-3px_6px_var(--neu-shadow-light)]",
        primary:
          "bg-primary text-primary-foreground shadow-[5px_5px_10px_var(--neu-shadow-dark),-5px_-5px_10px_var(--neu-shadow-light)] hover:shadow-[6px_6px_12px_var(--neu-shadow-dark),-6px_-6px_12px_var(--neu-shadow-light)] active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.2),inset_-3px_-3px_6px_rgba(255,255,255,0.1)]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-[5px_5px_10px_var(--neu-shadow-dark),-5px_-5px_10px_var(--neu-shadow-light)] hover:bg-destructive/90 active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.2),inset_-3px_-3px_6px_rgba(255,255,255,0.1)]",
        outline:
          "border-2 border-border bg-background shadow-[3px_3px_6px_var(--neu-shadow-dark),-3px_-3px_6px_var(--neu-shadow-light)] hover:bg-muted hover:shadow-[4px_4px_8px_var(--neu-shadow-dark),-4px_-4px_8px_var(--neu-shadow-light)] active:shadow-[inset_2px_2px_4px_var(--neu-shadow-dark),inset_-2px_-2px_4px_var(--neu-shadow-light)]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[4px_4px_8px_var(--neu-shadow-dark),-4px_-4px_8px_var(--neu-shadow-light)] hover:bg-secondary/90 active:shadow-[inset_2px_2px_4px_var(--neu-shadow-dark),inset_-2px_-2px_4px_var(--neu-shadow-light)]",
        ghost:
          "hover:bg-muted hover:text-foreground hover:shadow-[3px_3px_6px_var(--neu-shadow-dark),-3px_-3px_6px_var(--neu-shadow-light)]",
        link: "text-primary underline-offset-4 hover:underline",
        accent:
          "bg-accent text-accent-foreground shadow-[5px_5px_10px_var(--neu-shadow-dark),-5px_-5px_10px_var(--neu-shadow-light)] hover:shadow-[6px_6px_12px_var(--neu-shadow-dark),-6px_-6px_12px_var(--neu-shadow-light)] active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.2),inset_-3px_-3px_6px_rgba(255,255,255,0.1)]",
      },
      size: {
        default: "h-10 px-5 py-2 has-[>svg]:px-4",
        sm: "h-9 rounded-lg gap-1.5 px-4 has-[>svg]:px-3",
        lg: "h-12 rounded-xl px-8 has-[>svg]:px-5 text-base",
        icon: "size-10 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
