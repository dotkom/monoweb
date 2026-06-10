import { fieldControlClass, fieldPrimarySurfaceClass } from "#lib/field-classes"
import { cn } from "#lib/utils"

export const textareaClass = cn(
  "field-sizing-content flex min-h-16 w-full px-3 py-2 text-base md:text-sm",
  "placeholder:text-muted-foreground",
  fieldControlClass,
  fieldPrimarySurfaceClass
)
