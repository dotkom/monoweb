"use client"

import { Checkbox as ShadcnCheckbox } from "#components/checkbox"
import type { ComponentProps, ReactNode } from "react"
import { cn } from "../../utils"
import { Label } from "../Label/Label"

export type CheckboxProps = ComponentProps<typeof ShadcnCheckbox> & {
  label?: ReactNode
  labelClassName?: string
}

export function Checkbox({ label, className, labelClassName, id, ...props }: CheckboxProps) {
  return (
    <div className="flex flex-col gap-3 transition-colors">
      <div className="flex items-center gap-2">
        <ShadcnCheckbox id={id} className={className} {...props} />
        {label && (
          <Label
            htmlFor={id}
            className={cn(
              "text-base font-normal text-gray-800 dark:text-stone-200 select-none cursor-pointer",
              labelClassName
            )}
          >
            {label}
          </Label>
        )}
      </div>
    </div>
  )
}
