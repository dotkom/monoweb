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
    <div className="flex items-center gap-2">
      <CheckboxPrimitive.Root
        ref={ref}
        {...props}
        className={cn(
          "peer h-5 w-5 shrink-0 rounded-sm border transition-all duration-150 ease-in-out",
          "border-gray-400 bg-white hover:border-gray-600",
          "focus-visible:ring-2 focus-visible:ring-blue-200 focus-visible:ring-offset-2",
          "data-[state=checked]:bg-blue-300 data-[state=checked]:border-blue-200",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "dark:bg-stone-800 dark:border-stone-600 dark:hover:border-stone-400",
          "dark:data-[state=checked]:bg-sky-900 dark:data-[state=checked]:border-sky-900",
          "dark:focus-visible:ring-offset-stone-900",
          className
        )}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center text-blue-900 dark:text-sky-100">
          <Icon icon="tabler:check" width={16} />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>

      {label && (
        <Label htmlFor={props.id} className="text-base text-gray-800 dark:text-stone-200 select-none cursor-pointer">
          {label}
        </Label>
      )}
    </div>
  )
}
