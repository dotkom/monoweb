import { cn } from "#lib/utils"

export const interactionTransition =
  "transition-[color,background-color,box-shadow,transform,border-color] duration-200 ease-out motion-reduce:transition-none"

export const interactionFocusRing =
  "focus-visible:border-ring/40 focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:ring-offset-0"

export const interactionPress =
  "scale-100 enabled:active:scale-[0.98] motion-reduce:scale-100 motion-reduce:enabled:active:scale-100"

export const interactionBase = cn(interactionTransition, interactionFocusRing, interactionPress)

export const interactionInvalid =
  "aria-invalid:border-destructive/50 aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/40 dark:aria-invalid:ring-destructive/30"
