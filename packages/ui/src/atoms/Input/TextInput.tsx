import { Label } from "@radix-ui/react-label"
import { cva } from "cva"
import type { ComponentPropsWithRef, FC } from "react"
import { cn } from "../../utils"

export type TextInputProps = ComponentPropsWithRef<"input"> & {
  placeholder?: string
  label?: string
  error?: boolean | string
  width?: string
}

export const TextInput: FC<TextInputProps> = ({ label, error, width, ref, ...props }) => {
  return (
    <div className={cn("flex flex-col", width)}>
      {label && (
        <Label htmlFor={props.id} className="mb-2">
          {label} {props.required && <span className="text-red-950">*</span>}
        </Label>
      )}
      <input type="text" {...props} ref={ref} className={input({ error: Boolean(error), disabled: props.disabled })} />
      {typeof error === "string" && <span className="text-red-950 mt-1 text-xs">{error}</span>}
    </div>
  )
}

const input = cva(
  "border-solid border outline-hidden focus:border-blue-600 bg-white-3 hover:bg-white-4 active:bg-white-5 rounded-md p-2 focus:ring-2 focus:ring-brand",
  {
    variants: {
      error: {
        true: "text-red-950 border-red-600",
        false: "text-black border-slate-500",
      },
      disabled: {
        true: "cursor-not-allowed text-slate-900",
      },
    },
  }
)
