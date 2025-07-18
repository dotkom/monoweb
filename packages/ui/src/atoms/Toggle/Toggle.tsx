"use client"

import * as SwitchPrimitives from "@radix-ui/react-switch"
import * as React from "react"
import { cn } from "../../utils"

export type ToggleProps = React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>

export const Toggle = React.forwardRef<React.ElementRef<typeof SwitchPrimitives.Root>, ToggleProps>(
  ({ className, ...props }, ref) => (
    <SwitchPrimitives.Root
      className={cn(
        "focus:ring-gray-600 data-[state=unchecked]:bg-gray-500 data-[state=checked]:bg-blue-700 peer inline-flex h-[24px] w-[44px] shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-hidden focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitives.Root>
  )
)
Toggle.displayName = SwitchPrimitives.Root.displayName
