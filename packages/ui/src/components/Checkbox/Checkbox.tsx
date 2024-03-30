"use client";

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { cn } from "../../utils"
import { Label } from "../Label"
import { Icon } from "../Icon"

export interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label?: string
}

export const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  ({ className, label, ...props }, ref) => (
    <div className="flex items-center">
      <CheckboxPrimitive.Root
        ref={ref}
        className={cn(
          "border-slate-7 focus:ring-blue-7 peer h-6 w-6 shrink-0 rounded-sm border focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          "bg-white-3 hover:bg-white-4 active:bg-white-5",
          "hover:border-slate-8 transition-colors",
          "rdx-state-checked:bg-blue- rdx-state-checked:hover:bg-blue-6",
          "focus:ring-brand focus:ring-2",
          className
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator className={cn("grid w-full place-content-center")}>
          <Icon icon="tabler:check" width={21} />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {label && (
        <Label className="pl-3" htmlFor={props.id}>
          {label}
        </Label>
      )}
    </div>
  )
)
Checkbox.displayName = CheckboxPrimitive.Root.displayName
