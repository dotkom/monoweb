import { cva } from "class-variance-authority"

import { interactionTransition } from "#lib/interaction-classes"
import { cn } from "#lib/utils"

export const badgeVariants = cva(
  cn(
    "group/badge inline-flex h-6 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
    "focus-visible:border-ring/40 focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:ring-offset-0",
    "has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
    "aria-invalid:border-destructive/50 aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/30",
    "[&>svg]:pointer-events-none [&>svg]:size-3!",
    interactionTransition
  ),
  {
    variants: {
      variant: {
        default: "bg-primary/10 text-primary [a]:hover:bg-primary/15 dark:bg-primary/15 dark:text-primary",
        secondary: "border-border/50 bg-secondary/60 text-secondary-foreground [a]:hover:bg-secondary/80",
        destructive:
          "bg-destructive/10 text-destructive [a]:hover:bg-destructive/15 focus-visible:ring-destructive/20 dark:bg-destructive/12 dark:[a]:hover:bg-destructive/18",
        outline: "border-border/50 text-foreground [a]:hover:bg-muted/60 [a]:hover:text-foreground",
        ghost: "text-foreground [a]:hover:bg-muted/60 [a]:hover:text-foreground dark:[a]:hover:bg-muted/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)
