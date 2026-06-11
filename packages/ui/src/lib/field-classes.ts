import { interactionInvalid, interactionTransition } from "#lib/interaction-classes"
import { cn } from "#lib/utils"

export const fieldPrimarySurfaceClass = "shadow-none dark:bg-field/80"

export const fieldControlClass = cn(
  "rounded-field border border-field-border bg-field font-body outline-none",
  interactionTransition,
  interactionInvalid,
  "focus-visible:border-ring/40 focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:ring-offset-0",
  "hover:border-border/80 hover:bg-muted/20 dark:hover:bg-input/20",
  "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
)

export const fieldOutlineClass = cn(
  "border-field-border bg-background hover:bg-muted/60 hover:text-foreground",
  "aria-expanded:bg-muted/60 aria-expanded:text-foreground",
  "dark:bg-field/80 dark:hover:bg-input/30"
)
