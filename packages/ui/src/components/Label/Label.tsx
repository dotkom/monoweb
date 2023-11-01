import React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cn } from "../../utils"

export const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      "text-foreground inline-flex flex-col gap-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      props.htmlFor && "cursor-pointer",
      className
    )}
    {...props}
  />
))

Label.displayName = LabelPrimitive.Root.displayName
