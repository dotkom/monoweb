"use client"

import * as HoverCardPrimitive from "@radix-ui/react-hover-card"
import type { ComponentPropsWithRef, FC } from "react"
import { cn } from "../../utils"

export const HoverCard = HoverCardPrimitive.Root
export const HoverCardTrigger = HoverCardPrimitive.Trigger

export const HoverCardContent: FC<ComponentPropsWithRef<typeof HoverCardPrimitive.Content>> = ({
  className,
  ref,
  align = "center",
  sideOffset = 4,
  ...props
}) => {
  return (
    <HoverCardPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-64 rounded-lg border border-gray-200 text-gray-800 shadow-lg outline-hidden transition-transform ease-in-out",
        "data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out",
        "data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  )
}
