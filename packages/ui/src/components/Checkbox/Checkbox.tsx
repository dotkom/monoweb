import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { cn } from "../../utils"
import { Label } from "../Label"
import { Icon } from "../Icon"

export interface CheckboxProps extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  label?: string
}

export const Checkbox = React.forwardRef<React.ElementRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <div className="flex items-center">
        <CheckboxPrimitive.Root
          ref={ref}
          className={cn(
            "border-slate-7 focus:ring-blue-7  peer h-6 w-6 shrink-0 rounded-sm border focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ",
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
  }
)
Checkbox.displayName = CheckboxPrimitive.Root.displayName

// export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(({ label, ...props }, ref) => (
//   <div className="flex items-center">
//     <Root
//       ref={ref}
//       className={clsx(
//         // "bg-slate-3 h-7 w-7 appearance-none rounded-sm outline-none transition-colors",
//         // "hover:bg-slate-4 focus:ring-2",
//         // "rdx-state-checked:bg-blue-4 ",
//         // "rdx-disabled:bg-slate-5 rdx-state-checked:rdx-disabled:bg-slate-5 rdx-disabled:cursor-not-allowed"
//       )}
//       {...props}
//     >
//       <Indicator className="text-slate-12 rdx-disabled:text-slate-11 flex items-center justify-center">
//         {props.checked === "indeterminate" && <IoRemoveSharp className="h-5 w-5" />}
//         {props.checked === true && <IoCheckmarkSharp className="h-5 w-5" />}
//       </Indicator>
//     </Root>
//     <Label htmlFor={props.id} className="select-none pl-2 text-lg leading-none">
//       {label}
//     </Label>
//   </div>
// ))
