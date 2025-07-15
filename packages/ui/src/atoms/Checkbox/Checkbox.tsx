import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import type { ComponentPropsWithRef, FC } from "react"
import { cn } from "../../utils"
import { Icon } from "../Icon/Icon"
import { Label } from "../Label/Label"

export type CheckboxProps = ComponentPropsWithRef<typeof CheckboxPrimitive.Root> & {
  label?: string
}

export const Checkbox: FC<CheckboxProps> = ({ label, className, ref, ...props }) => {
  return (
    <div className="flex items-center">
      <CheckboxPrimitive.Root
        ref={ref}
        className={cn(
          "border-gray-600 focus:ring-blue-600 peer h-6 w-6 shrink-0 rounded-xs border focus:outline-hidden focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          "bg-white-3 hover:bg-white-4 active:bg-white-5",
          "hover:border-gray-700 transition-colors",
          "rdx-state-checked:bg-blue- rdx-state-checked:hover:bg-blue-500",
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
}
