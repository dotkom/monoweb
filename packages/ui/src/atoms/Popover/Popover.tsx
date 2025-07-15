"use client"

import * as PopoverPrimitive from "@radix-ui/react-popover"
import type * as React from "react"
import { cn } from "../../utils"

export const Popover = PopoverPrimitive.Root

export const PopoverTrigger = PopoverPrimitive.Trigger

type PopoverContentProps = React.ComponentPropsWithRef<typeof PopoverPrimitive.Content> & {
  align?: React.ComponentPropsWithRef<typeof PopoverPrimitive.Content>["align"]
  sideOffset?: React.ComponentPropsWithRef<typeof PopoverPrimitive.Content>["sideOffset"]
}

export const PopoverContent = ({ className, align = "center", sideOffset = 4, ref, ...props }: PopoverContentProps) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 outline-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--radix-popover-content-transform-origin)",
        "rounded-lg p-2 text-popover-foreground shadow-sm",
        "border border-gray-200 bg-slate-50",
        "dark:border-stone-700 dark:bg-stone-800 dark:text-white",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
)
PopoverContent.displayName = PopoverPrimitive.Content.displayName
