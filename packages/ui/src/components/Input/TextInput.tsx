import { Label } from "@radix-ui/react-label"
import { cva } from "cva"
import { forwardRef } from "react"
import { cn } from "../../utils"

export interface InputProps extends React.HTMLProps<HTMLInputElement> {
  placeholder?: string
  label?: string
  error?: boolean | string
  width?: string
}

export const TextInput = forwardRef<HTMLInputElement, InputProps>(({ label, error, width, ...props }, ref) => (
  <div className={cn("flex flex-col", width)}>
    {label && (
      <Label htmlFor={props.id} className="mb-2">
        {label} {props.required && <span className="text-red-11">*</span>}
      </Label>
    )}
    <input type="text" {...props} ref={ref} className={input({ error: Boolean(error), disabled: props.disabled })} />
    {typeof error === "string" && <span className="text-red-11 mt-1 text-xs">{error}</span>}
  </div>
))

TextInput.displayName = "TextInput"

const input = cva(
  "border-solid border outline-none focus:border-blue-7 bg-white-3 hover:bg-white-4 active:bg-white-5 rounded-md p-2 focus:ring-2 focus:ring-brand",
  {
    variants: {
      error: {
        true: "text-red-11 border-red-7",
        false: "text-slate-12 border-slate-6",
      },
      disabled: {
        true: "cursor-not-allowed text-slate-10",
      },
    },
  }
)
