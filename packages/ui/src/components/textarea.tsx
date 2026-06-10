import type * as React from "react"

import { textareaClass } from "#lib/textarea-classes"
import { cn } from "#lib/utils"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return <textarea data-slot="textarea" className={cn(textareaClass, className)} {...props} />
}

export { Textarea }
