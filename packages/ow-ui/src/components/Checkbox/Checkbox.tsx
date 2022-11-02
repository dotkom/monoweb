import { Indicator, Root, CheckboxProps as PrimitiveProps } from "@radix-ui/react-checkbox"
import { Label } from "@radix-ui/react-label"
import clsx from "clsx"
import { forwardRef } from "react"
import { IoCheckmarkSharp, IoRemoveSharp } from "react-icons/io5"

export interface CheckboxProps extends PrimitiveProps {
  label: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({ label, ...props }, ref) => (
  <div className="flex items-center">
    <Root
      ref={ref}
      className={clsx(
        "bg-slate-3 h-7 w-7 appearance-none rounded-sm outline-none transition-colors",
        "hover:bg-slate-4 focus:ring-blue-7",
        "rdx-state-checked:bg-blue-3 rdx-state-checked:hover:bg-blue-4",
        "rdx-disabled:bg-slate-5 rdx-state-checked:rdx-disabled:bg-slate-5 rdx-disabled:cursor-not-allowed"
      )}
      {...props}
    >
      <Indicator className="text-slate-12 rdx-disabled:text-slate-11 flex items-center justify-center">
        {props.checked === "indeterminate" && <IoRemoveSharp className="h-5 w-5" />}
        {props.checked === true && <IoCheckmarkSharp className="h-5 w-5" />}
      </Indicator>
    </Root>
    <Label htmlFor={props.id} className="select-none pl-2 text-lg leading-none">
      {label}
    </Label>
  </div>
))
