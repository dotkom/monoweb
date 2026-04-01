import * as LabelPrimitive from "@radix-ui/react-label"
import type { ComponentPropsWithRef, FC } from "react"
import { cn } from "../../utils"
import { Text } from "../Typography/Text"

export const Label: FC<ComponentPropsWithRef<typeof LabelPrimitive.Root>> = ({ className, ref, ...props }) => {
  return (
    <Text
      element={LabelPrimitive.Root}
      ref={ref}
      className={cn(
        "text-foreground inline-flex flex-col gap-1 text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        props.htmlFor && "cursor-pointer",
        className
      )}
      {...props}
    />
  )
}
