import type * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"
import type { VariantProps } from "class-variance-authority"

import { inputVariants } from "#lib/input-classes"
import { cn } from "#lib/utils"

function Input({
  className,
  type,
  variant = "primary",
  ...props
}: React.ComponentProps<"input"> & VariantProps<typeof inputVariants>) {
  return (
    <InputPrimitive type={type} data-slot="input" className={cn(inputVariants({ variant }), className)} {...props} />
  )
}

export { Input, inputVariants }
