import { cva } from "class-variance-authority"

import { fieldOutlineClass } from "#lib/field-classes"
import { interactionBase, interactionInvalid } from "#lib/interaction-classes"
import { cn } from "#lib/utils"

export const buttonBaseClass = cn(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent text-sm font-medium whitespace-nowrap outline-none select-none disabled:opacity-50",
  interactionBase,
  interactionInvalid,
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
)

const buttonSizeMap = {
  default: "h-8 gap-1.5 px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
  xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
  sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3.5",
  lg: "h-9 gap-1.5 px-3.5 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
  xl: "h-10 gap-2 px-4 text-base has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
  icon: "size-8",
  "icon-xs":
    "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
  "icon-sm": "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
  "icon-lg": "size-9",
  "icon-xl": "size-10 [&_svg:not([class*='size-'])]:size-5",
} as const

export const buttonSizeVariants = cva(buttonBaseClass, {
  variants: {
    size: buttonSizeMap,
  },
  defaultVariants: {
    size: "default",
  },
})

export const buttonVariants = cva(buttonBaseClass, {
  variants: {
    variant: {
      default: "border-0 bg-primary text-primary-foreground shadow-surface hover:bg-primary/90",
      outline: fieldOutlineClass,
      secondary:
        "border-field-border bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground dark:bg-field/80",
      ghost:
        "hover:bg-muted/70 hover:text-foreground aria-expanded:bg-muted/70 aria-expanded:text-foreground dark:hover:bg-muted/40",
      destructive:
        "bg-destructive/10 text-destructive hover:bg-destructive/15 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/15 dark:hover:bg-destructive/20 dark:focus-visible:ring-destructive/30",
      link: "text-primary underline-offset-4 hover:underline",
    },
    size: buttonSizeMap,
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})
