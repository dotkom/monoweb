import * as LabelPrimitive from "@radix-ui/react-label"
import type { ComponentPropsWithRef, FC } from "react"
import { cn } from "../../utils"

export const Label: FC<ComponentPropsWithRef<typeof LabelPrimitive.Root>> = ({ className, ref, ...props }) => {
  return (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(
        "text-foreground inline-flex flex-col gap-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        props.htmlFor && "cursor-pointer",
        className
      )}
      {...props}
    />
  )
}
