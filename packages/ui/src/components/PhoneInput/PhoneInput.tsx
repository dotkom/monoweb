"use client"
import { Label } from "@radix-ui/react-label"
import { cva } from "cva"
import { forwardRef } from "react"
import PhoneInputWithCountry, {
  type DefaultInputComponentProps,
  type Props,
  isValidPhoneNumber as isValidPhoneNumberOrigin,
} from "react-phone-number-input"
import "react-phone-number-input/style.css"
import { cn } from "../../utils"

export interface CustomPhoneInputProps extends Props<DefaultInputComponentProps> {
  defaultValue?: string
  label?: string
  width?: string
  error?: string
}

const PhoneInput = forwardRef<CustomPhoneInputProps, DefaultInputComponentProps>(
  ({ defaultValue, label, width, error, ...props }, ref) => (
    <div className={cn("flex flex-col", width)}>
      {label && (
        <Label htmlFor={props.id} className="mb-2">
          {label} {props.required && <span className="text-red-11">*</span>}
        </Label>
      )}
      <PhoneInputWithCountry
        onChange={props.onChange}
        value={defaultValue}
        className={cn("flex w-full space-x-2")}
        numberInputProps={{ className: input({ error: Boolean(error), disabled: props.disabled }) }}
        limitMaxLength
        defaultCountry="NO"
        {...props}
      />
      {typeof error === "string" && <span className="text-red-11 mt-1 text-xs ml-12">{error}</span>}
    </div>
  )
)

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

const isValidPhoneNumber = (phoneNumber: string) => {
  return isValidPhoneNumberOrigin(phoneNumber)
}

export { PhoneInput, isValidPhoneNumber }
